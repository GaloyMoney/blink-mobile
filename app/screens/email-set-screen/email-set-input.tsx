import { gql } from "@apollo/client"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { useUserEmailRegistrationInitiateMutation } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Input, Text, makeStyles } from "@rneui/themed"
import * as React from "react"
import { View } from "react-native"
import { Screen } from "../../components/screen"
import validator from "validator"
import { GaloyErrorBox } from "@app/components/atomic/galoy-error-box"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

const PLACEHOLDER_EMAIL = "hal@finney.org"
const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },

  inputContainer: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 48,
  },
  textContainer: {
    marginBottom: 20,
  },
  viewWrapper: { flex: 1 },

  inputContainerStyle: {
    flex: 1,
    borderWidth: 2,
    borderBottomWidth: 2,
    paddingHorizontal: 10,
    borderColor: colors.primary5,
    borderRadius: 8,
  },
  errorContainer: {
    marginBottom: 20,
  },
}))

gql`
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

export const EmailSetInputScreen: React.FC = () => {
  const styles = useStyles()

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "emailSetInput">>()

  const [emailInput, setEmailInput] = React.useState<string>("")
  const [errorMessage, setErrorMessage] = React.useState<string>("")
  const [loading, setLoading] = React.useState<boolean>(false)

  const { LL } = useI18nContext()

  const [setEmailMutation] = useUserEmailRegistrationInitiateMutation()

  const submit = async () => {
    if (!validator.isEmail(emailInput)) {
      setErrorMessage(LL.EmailSetInputScreen.invalidEmail())
      return
    }

    setLoading(true)

    try {
      const { data } = await setEmailMutation({
        variables: { input: { email: emailInput } },
      })

      const errors = data?.userEmailRegistrationInitiate.errors
      if (errors && errors.length > 0) {
        console.log(errors, "errors")
        setErrorMessage(errors[0].message)
      }

      const emailRegistrationId = data?.userEmailRegistrationInitiate.emailRegistrationId

      if (emailRegistrationId) {
        navigation.navigate("emailSetValidation", {
          emailRegistrationId,
          email: emailInput,
        })
      } else {
        console.warn("no flow returned")
      }
    } catch (err) {
      console.error(err, "error in setEmailMutation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen
      preset="scroll"
      style={styles.screenStyle}
      keyboardOffset="navigationHeader"
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.viewWrapper}>
        <View style={styles.textContainer}>
          <Text type={"p1"}>{LL.EmailSetInputScreen.header()}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Input
            autoCapitalize="none"
            placeholder={PLACEHOLDER_EMAIL}
            inputContainerStyle={styles.inputContainerStyle}
            renderErrorMessage={false}
            textContentType="emailAddress"
            keyboardType="email-address"
            value={emailInput}
            onChangeText={setEmailInput}
            autoFocus={true}
          />
        </View>
        {errorMessage && (
          <View style={styles.errorContainer}>
            <GaloyErrorBox errorMessage={errorMessage} />
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <GaloyPrimaryButton
            title={LL.EmailSetInputScreen.send()}
            loading={loading}
            disabled={!emailInput}
            onPress={submit}
          />
        </View>
      </View>
    </Screen>
  )
}
