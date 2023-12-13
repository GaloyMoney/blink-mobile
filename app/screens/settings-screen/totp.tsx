import { Alert } from "react-native"
import { useState } from "react"

import { SettingsRow } from "./row"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"

import { useI18nContext } from "@app/i18n/i18n-react"

import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

import { gql } from "@apollo/client"
import { useUserTotpDeleteMutation } from "@app/graphql/generated"
import { useSettingsContext } from "./settings-context"

gql`
  mutation userTotpDelete {
    userTotpDelete {
      errors {
        message
      }
      me {
        id
        phone
        totpEnabled
        email {
          address
          verified
        }
      }
    }
  }
`

export const TotpSetting: React.FC = () => {
  const { LL } = useI18nContext()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  const [spinner, setSpinner] = useState(false)

  const { data, loading, refetch: refetchTotpSettings } = useSettingsContext()
  const [totpDeleteMutation] = useUserTotpDeleteMutation()

  const totpEnabled = Boolean(data?.me?.totpEnabled)

  const totpDelete = async () => {
    Alert.alert(
      LL.AccountScreen.totpDeleteAlertTitle(),
      LL.AccountScreen.totpDeleteAlertContent(),
      [
        { text: LL.common.cancel(), onPress: () => {} },
        {
          text: LL.common.ok(),
          onPress: async () => {
            setSpinner(true)
            const res = await totpDeleteMutation()
            await refetchTotpSettings()
            setSpinner(false)

            if (res.data?.userTotpDelete?.me?.totpEnabled === false) {
              Alert.alert(LL.AccountScreen.totpDeactivated())
            } else {
              console.log(res.data?.userTotpDelete.errors)
              Alert.alert(LL.common.error(), res.data?.userTotpDelete?.errors[0]?.message)
            }
          },
        },
      ],
    )
  }

  return (
    <SettingsRow
      loading={loading}
      spinner={spinner}
      title={LL.AccountScreen.totp()}
      subtitle={totpEnabled ? LL.common.enabled() : undefined}
      leftIcon="lock-closed-outline"
      action={
        totpEnabled
          ? null
          : () => {
              navigate("totpRegistrationInitiate")
            }
      }
      rightIcon={
        totpEnabled ? (
          <GaloyIconButton name="close" size="medium" onPress={totpDelete} />
        ) : undefined
      }
    />
  )
}
