import { Alert, View } from "react-native"
import { makeStyles, useTheme } from "@rneui/themed"

import { useI18nContext } from "@app/i18n/i18n-react"
import { TranslationFunctions } from "@app/i18n/i18n-types"
import { useLevel } from "@app/graphql/level-context"

import { SettingsRow } from "../../row"
import { toastShow } from "@app/utils/toast"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { ModalTooltip } from "@app/components/modal-tooltip/modal-tooltip"

import { gql } from "@apollo/client"
import {
  useEmailSettingQuery,
  useUserEmailDeleteMutation,
  useUserEmailRegistrationInitiateMutation,
} from "@app/graphql/generated"

import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

gql`
  query EmailSetting {
    me {
      phone
      email {
        address
        verified
      }
    }
  }

  mutation userEmailDelete {
    userEmailDelete {
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

  mutation userEmailRegistrationInitiate($input: UserEmailRegistrationInitiateInput!) {
    userEmailRegistrationInitiate(input: $input) {
      errors {
        message
      }
      emailRegistrationId
      me {
        id
        email {
          address
          verified
        }
      }
    }
  }
`

type EmailState = "NotFound" | "Unverified" | "Verified"

const title = (state: EmailState, LL: TranslationFunctions): string => {
  switch (state) {
    case "NotFound":
      return LL.AccountScreen.tapToAddEmail()
    case "Unverified":
      return LL.AccountScreen.unverifiedEmai()
    case "Verified":
      return LL.AccountScreen.email()
  }
}

export const EmailSetting: React.FC = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const { LL } = useI18nContext()
  const { isAtLeastLevelZero } = useLevel()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  const { data, loading } = useEmailSettingQuery({
    fetchPolicy: "cache-and-network",
    skip: !isAtLeastLevelZero,
  })
  const email = data?.me?.email?.address

  let emailState: EmailState = "NotFound"
  if (email) {
    emailState = email && data?.me?.email?.verified ? "Verified" : "Unverified"
  } else {
    emailState = "NotFound"
  }

  const phoneAndEmailVerified = emailState === "Verified" && Boolean(data?.me?.phone)

  const [emailDeleteMutation, { loading: emDelLoading }] = useUserEmailDeleteMutation()
  const [setEmailMutation, { loading: emRegLoading }] =
    useUserEmailRegistrationInitiateMutation()

  const deleteEmail = async () => {
    try {
      await emailDeleteMutation()
      toastShow({
        type: "success",
        message: LL.AccountScreen.emailDeletedSuccessfully(),
        LL,
      })
    } catch (err) {
      let message = ""
      if (err instanceof Error) {
        message = err?.message
      }
      Alert.alert(LL.common.error(), message)
    }
  }

  const deleteEmailPrompt = async () => {
    Alert.alert(
      LL.AccountScreen.deleteEmailPromptTitle(),
      LL.AccountScreen.deleteEmailPromptContent(),
      [
        { text: LL.common.cancel(), onPress: () => {} },
        {
          text: LL.common.yes(),
          onPress: async () => {
            deleteEmail()
          },
        },
      ],
    )
  }

  const tryConfirmEmailAgain = async (email: string) => {
    try {
      await emailDeleteMutation({
        // to avoid flacky behavior
        // this could lead to inconsistent state if delete works but set fails
        fetchPolicy: "no-cache",
      })

      const { data } = await setEmailMutation({
        variables: { input: { email } },
      })

      const errors = data?.userEmailRegistrationInitiate.errors
      if (errors && errors.length > 0) {
        Alert.alert(errors[0].message)
      }

      const emailRegistrationId = data?.userEmailRegistrationInitiate.emailRegistrationId

      if (emailRegistrationId) {
        navigate("emailRegistrationValidate", {
          emailRegistrationId,
          email,
        })
      } else {
        console.warn("no flow returned")
      }
    } catch (err) {
      console.error(err, "error in setEmailMutation")
    } finally {
      // setLoading(false)
    }
  }

  const reVerifyEmailPrompt = () => {
    if (!email) return
    Alert.alert(
      LL.AccountScreen.emailUnverified(),
      LL.AccountScreen.emailUnverifiedContent(),
      [
        { text: LL.common.cancel(), onPress: () => {} },
        {
          text: LL.common.ok(),
          onPress: () => tryConfirmEmailAgain(email),
        },
      ],
    )
  }

  return (
    <SettingsRow
      loading={loading}
      spinner={emDelLoading || emRegLoading}
      title={title(emailState, LL)}
      subtitle={emailState === "NotFound" ? undefined : email?.toString()}
      leftIcon="mail-outline"
      extraComponentBesideTitle={
        emailState === "Unverified" ? (
          <ModalTooltip
            size={20}
            type="info"
            text={LL.AccountScreen.unverifiedEmailAdvice()}
          />
        ) : undefined
      }
      action={
        emailState === "NotFound" ? () => navigate("emailRegistrationInitiate") : null
      }
      rightIcon={
        emailState === "NotFound" ? undefined : (
          <View style={styles.sidetoside}>
            {emailState === "Unverified" && (
              <GaloyIconButton
                name="refresh"
                size="medium"
                onPress={reVerifyEmailPrompt}
                color={colors.black}
              />
            )}
            {phoneAndEmailVerified && (
              <GaloyIconButton
                name="close"
                size="medium"
                onPress={deleteEmailPrompt}
                color={colors.black}
                backgroundColor={colors.red}
              />
            )}
          </View>
        )
      }
    />
  )
}

const useStyles = makeStyles(() => ({
  sidetoside: {
    display: "flex",
    flexDirection: "row",
    columnGap: 10,
  },
}))
