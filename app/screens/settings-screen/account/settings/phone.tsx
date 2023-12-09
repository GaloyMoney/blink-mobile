import { Alert } from "react-native"
import { makeStyles, useTheme } from "@rneui/themed"

import { useI18nContext } from "@app/i18n/i18n-react"
import { useLevel } from "@app/graphql/level-context"

import { SettingsRow } from "../../row"
import { toastShow } from "@app/utils/toast"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"

import { gql } from "@apollo/client"
import { usePhoneSettingQuery, useUserPhoneDeleteMutation } from "@app/graphql/generated"

import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

gql`
  query PhoneSetting {
    me {
      phone
      email {
        address
        verified
      }
    }
  }

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

type PhoneState = "NotFound" | "Set"

export const PhoneSetting: React.FC = () => {
  useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const { LL } = useI18nContext()
  const { isAtLeastLevelZero } = useLevel()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  const { data, loading } = usePhoneSettingQuery({
    fetchPolicy: "cache-and-network",
    skip: !isAtLeastLevelZero,
  })
  const phone = data?.me?.phone
  const emailVerified =
    Boolean(data?.me?.email?.address) && Boolean(data?.me?.email?.verified)

  const [phoneDeleteMutation, { loading: phDelLoad }] = useUserPhoneDeleteMutation()

  let phoneState: PhoneState = "NotFound"
  if (phone) {
    phoneState = "Set"
  }

  const deletePhone = async () => {
    try {
      await phoneDeleteMutation()
      toastShow({
        message: LL.AccountScreen.phoneDeletedSuccessfully(),
        LL,
        type: "success",
      })
    } catch (err) {
      let message = ""
      if (err instanceof Error) {
        message = err?.message
      }
      Alert.alert(LL.common.error(), message)
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
        phoneState === "Set"
          ? LL.AccountScreen.phoneNumber()
          : LL.AccountScreen.tapToAddPhoneNumber()
      }
      subtitle={phone || undefined}
      leftIcon="call-outline"
      action={
        phoneState === "NotFound" ? () => navigate("phoneRegistrationInitiate") : null
      }
      spinner={phDelLoad}
      rightIcon={
        phoneState === "NotFound" ? undefined : emailVerified ? (
          <GaloyIconButton
            name="close"
            size="medium"
            onPress={deletePhonePrompt}
            color={colors.black}
            backgroundColor={colors.red}
          />
        ) : null
      }
    />
  )
}

const useStyles = makeStyles(() => ({}))
