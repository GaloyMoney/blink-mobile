import { gql } from "@apollo/client"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { Screen } from "@app/components/screen"
import { CopySecretComponent, QrCodeComponent } from "@app/components/totp-export"
import {
  useTotpRegistrationScreenQuery,
  useUserTotpRegistrationInitiateMutation,
} from "@app/graphql/generated"
import { useAppConfig } from "@app/hooks"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Text } from "@rneui/themed"
import { useEffect, useState } from "react"
import { Alert } from "react-native"

const generateOtpAuthURI = (
  accountName: string,
  issuer: string,
  secret: string,
): string => {
  const encodedAccount = encodeURIComponent(accountName)
  const encodedIssuer = encodeURIComponent(issuer)
  const base = `otpauth://totp/${issuer}:${encodedAccount}?`
  const params = `secret=${secret}&issuer=${encodedIssuer}`
  return base + params
}

gql`
  query totpRegistrationScreen {
    me {
      username
    }
  }

  mutation userTotpRegistrationInitiate($input: UserTotpRegistrationInitiateInput!) {
    userTotpRegistrationInitiate(input: $input) {
      errors {
        message
      }
      totpRegistrationId
      totpSecret
    }
  }
`

export const TotpRegistrationInitiateScreen = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "totpRegistrationInitiate">>()

  const [totpRegistrationInitiate] = useUserTotpRegistrationInitiateMutation()

  const { data } = useTotpRegistrationScreenQuery()
  const username = data?.me?.username || "blink"

  const [secret, setSecret] = useState("")
  const [totpRegistrationId, setTotpRegistrationId] = useState("")

  const { appConfig } = useAppConfig()
  const authToken = appConfig.token
  const service = appConfig.galoyInstance.name

  const otpauth = generateOtpAuthURI(username, service, secret)

  useEffect(() => {
    const fn = async () => {
      const res = await totpRegistrationInitiate({ variables: { input: { authToken } } })

      if (res.data?.userTotpRegistrationInitiate?.totpRegistrationId) {
        setTotpRegistrationId(res.data?.userTotpRegistrationInitiate?.totpRegistrationId)
      } else {
        Alert.alert("missing totpRegistrationId")
        // Handle error
      }

      if (res.data?.userTotpRegistrationInitiate?.totpSecret) {
        setSecret(res.data?.userTotpRegistrationInitiate.totpSecret)
      } else {
        Alert.alert("missing secret")
        // Handle error
      }
    }
    fn()
  }, [authToken, totpRegistrationInitiate])

  return (
    <Screen>
      <QrCodeComponent otpauth={otpauth} />
      <Text type="h2">Scan this QR code with your authenticator app</Text>
      <CopySecretComponent secret={secret} />
      <Text>Registration ID: {totpRegistrationId}</Text>
      <Text>Secret: {secret}</Text>
      <GaloyPrimaryButton
        title="Next"
        onPress={() =>
          navigation.navigate("totpRegistrationValidate", { totpRegistrationId })
        }
      />
    </Screen>
  )
}
