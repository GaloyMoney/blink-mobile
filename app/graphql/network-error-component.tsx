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

  const [showedAlert, setShowedAlert] = useState(false)

  // FIXME: remove once logout() is fixed
  const [lastNetworkError, setLastNetworkError] = useState(networkError)

  React.useEffect(() => {
    if (!networkError) {
      return
    }

    // FIXME: remove once logout() is fixed
    if (lastNetworkError === networkError) {
      return
    }
    setLastNetworkError(networkError)

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
          // FIXME: do not use logout() automatically until this is solved
          // https://github.com/ory/kratos/issues/3250
          // logout()

          if (!showedAlert) {
            setShowedAlert(true)
            // Alert.alert(LL.common.reauth(), "", [
            Alert.alert(LL.common.problemMaybeReauth(), "", [
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
  }, [
    networkError,
    LL,
    logout,
    showedAlert,
    setShowedAlert,
    navigation,
    lastNetworkError,
  ])

  return <></>
}
