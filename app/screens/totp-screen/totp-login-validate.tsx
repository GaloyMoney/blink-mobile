import { CodeInput } from "@app/components/code-input"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import axios, { isAxiosError } from "axios"
import React, { useCallback, useState } from "react"
import analytics from "@react-native-firebase/analytics"

type Props = {
  route: RouteProp<RootStackParamList, "totpLoginValidate">
}

export const TotpLoginValidateScreen: React.FC<Props> = ({ route }) => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "totpLoginValidate">>()

  const [errorMessage, setErrorMessage] = useState<string>("")
  const { saveToken } = useAppConfig()

  const [loading, setLoading] = useState(false)
  const authToken = route.params.authToken

  const {
    appConfig: {
      galoyInstance: { authUrl },
    },
  } = useAppConfig()

  const { LL } = useI18nContext()

  const send = useCallback(
    async (code: string) => {
      try {
        setLoading(true)

        const url = `${authUrl}/auth/totp/validate`

        const response = await axios({
          url,
          method: "POST",
          data: {
            totpCode: code,
            authToken,
          },
        })

        const success = response.status === 200
        if (success) {
          analytics().logLogin({
            method: "email-2fa",
          })

          saveToken(authToken)
          navigation.reset({
            routes: [{ name: "Primary" }],
          })
          return
        }
      } catch (err) {
        console.error(err, "error axios")
        if (isAxiosError(err)) {
          console.log(err.message) // Gives you the basic error message
          console.log(err.response?.data) // Gives you the response payload from the server
          console.log(err.response?.status) // Gives you the HTTP status code
          console.log(err.response?.headers) // Gives you the response headers

          // If the request was made but no response was received
          if (!err.response) {
            console.log(err.request)
          }

          if (err.response?.data?.error) {
            setErrorMessage(err.response?.data?.error)
          } else {
            setErrorMessage(err.message)
          }
        }
      } finally {
        setLoading(false)
      }
    },
    [authToken, navigation, authUrl, saveToken],
  )

  const header = LL.TotpLoginValidateScreen.content()

  return (
    <CodeInput
      send={send}
      header={header}
      loading={loading}
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
    />
  )
}
