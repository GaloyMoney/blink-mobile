import { Alert } from "react-native"

import { useI18nContext } from "@app/i18n/i18n-react"
import { useLoginMethods } from "../login-methods-hook"

import { SettingsRow } from "../../row"
import { toastShow } from "@app/utils/toast"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"

import { gql } from "@apollo/client"
import { useUserPhoneDeleteMutation } from "@app/graphql/generated"

import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

gql`
  mutation userPhoneDelete {
    userPhoneDelete {
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

export const PhoneSetting: React.FC = () => {
  const { LL } = useI18nContext()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  const { loading, phone, emailVerified, phoneVerified } = useLoginMethods()

  const [phoneDeleteMutation, { loading: phDelLoad }] = useUserPhoneDeleteMutation()

  const deletePhone = async () => {
    try {
      await phoneDeleteMutation()
      toastShow({
        message: LL.AccountScreen.phoneDeletedSuccessfully(),
        LL,
        type: "success",
      })
    } catch (err) {
      Alert.alert(LL.common.error(), err instanceof Error ? err.message : "")
    }
  }
  const deletePhonePrompt = async () => {
    Alert.alert(
      LL.AccountScreen.deletePhonePromptTitle(),
      LL.AccountScreen.deletePhonePromptContent(),
      [
        { text: LL.common.cancel(), onPress: () => {} },
        {
          text: LL.common.yes(),
          onPress: async () => {
            deletePhone()
          },
        },
      ],
    )
  }

  return (
    <SettingsRow
      loading={loading}
      title={
        phoneVerified
          ? LL.AccountScreen.phoneNumber()
          : LL.AccountScreen.tapToAddPhoneNumber()
      }
      subtitle={phone || undefined}
      leftIcon="call-outline"
      action={phoneVerified ? null : () => navigate("phoneRegistrationInitiate")}
      spinner={phDelLoad}
      rightIcon={
        phoneVerified ? (
          emailVerified ? (
            <GaloyIconButton name="close" size="medium" onPress={deletePhonePrompt} />
          ) : null
        ) : undefined
      }
    />
  )
}
