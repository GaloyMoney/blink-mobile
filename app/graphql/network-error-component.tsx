import useLogout from "@app/hooks/use-logout"
import { useI18nContext } from "@app/i18n/i18n-react"
import { toastShow } from "@app/utils/toast"
import React, { useState } from "react"
import { NetworkErrorCode } from "./error-code"
import { Alert } from "react-native"
import { useNetworkError } from "./network-error-context"
import { CommonActions, useNavigation } from "@react-navigation/native"

export const NetworkErrorComponent: React.FC = () => {
  const navigation = useNavigation()

  const networkError = useNetworkError()
  const { LL } = useI18nContext()
  const { logout } = useLogout()
  const [num401retries, setNum401retries] = useState(0)

  const [showedAlert, setShowedAlert] = useState(false)

  React.useEffect(() => {
    if (!networkError) {
      return
    }

    if (networkError.statusCode >= 500) {
      // TODO translation
      toastShow({
        message: (translations) => translations.errors.network.server(),
        currentTranslation: LL,
      })

      return
    }

    if (networkError.statusCode >= 400 && networkError.statusCode < 500) {
      let errorCode = networkError.result?.errors?.[0]?.code

      if (!errorCode) {
        switch (networkError.statusCode) {
          case 401:
            errorCode = NetworkErrorCode.InvalidAuthentication
            break
        }
      }

      switch (errorCode) {
        case NetworkErrorCode.InvalidAuthentication:
          if (num401retries > 3) {
            setNum401retries(0)
            logout()
          } else {
            setNum401retries(num401retries + 1)
            toastShow({
              message: (translations) =>
                `Retrying... StatusCode: ${
                  networkError.statusCode
                }\nError code: ${errorCode}\n${translations.errors.network.request()}`,
              currentTranslation: LL,
            })
            return
          }

          if (!showedAlert) {
            setShowedAlert(true)
            Alert.alert(LL.common.reauth(), "", [
              {
                text: LL.common.ok(),

                onPress: () => {
                  setShowedAlert(false)
                  navigation.dispatch(() => {
                    const routes = [{ name: "Primary" }]
                    return CommonActions.reset({
                      routes,
                      index: routes.length - 1,
                    })
                  })
                },
              },
            ])
          }
          break

        default:
          // TODO translation
          toastShow({
            message: (translations) =>
              `StatusCode: ${
                networkError.statusCode
              }\nError code: ${errorCode}\n${translations.errors.network.request()}`,
            currentTranslation: LL,
          })
          break
      }

      return
    }

    if (networkError.message === "Network request failed") {
      // TODO translation
      toastShow({
        message: (translations) => translations.errors.network.connection(),
        currentTranslation: LL,
      })
    }
  }, [networkError, LL, logout, showedAlert, setShowedAlert, navigation])

  return <></>
}
