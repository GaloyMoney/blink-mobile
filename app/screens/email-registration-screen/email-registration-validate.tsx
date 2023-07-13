import { gql } from "@apollo/client"
import { useUserEmailRegistrationValidateMutation } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RouteProp, useNavigation, useTheme } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Input, Text, makeStyles } from "@rneui/themed"
import * as React from "react"
import { useCallback, useState } from "react"
import { ActivityIndicator, Alert, View } from "react-native"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { GaloyErrorBox } from "@app/components/atomic/galoy-error-box"

const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
  viewWrapper: { flex: 1 },

  activityIndicator: { marginTop: 12 },
  textContainer: {
    marginBottom: 20,
  },

  inputComponentContainerStyle: {
    flexDirection: "row",
    marginBottom: 20,
    paddingLeft: 0,
    paddingRight: 0,
    justifyContent: "center",
  },
  inputContainerStyle: {
    minWidth: 160,
    minHeight: 60,
    borderWidth: 2,
    borderBottomWidth: 2,
    paddingHorizontal: 10,
    borderColor: colors.primary5,
    borderRadius: 8,
    marginRight: 0,
  },
  inputStyle: {
    fontSize: 24,
    textAlign: "center",
  },
  errorContainer: {
    marginBottom: 20,
  },
}))

gql`
  mutation userEmailRegistrationValidate($input: UserEmailRegistrationValidateInput!) {
    userEmailRegistrationValidate(input: $input) {
      errors {
        message
      }
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

type EmailRegistrationValidateScreenProps = {
  route: RouteProp<RootStackParamList, "emailRegistrationValidate">
}

export const EmailRegistrationValidateScreen: React.FC<
  EmailRegistrationValidateScreenProps
> = ({ route }) => {
  const styles = useStyles()
  const { colors } = useTheme()
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "emailRegistrationValidate">>()

  const [errorMessage, setErrorMessage] = React.useState<string>("")

  const { LL } = useI18nContext()

  const [emailVerify] = useUserEmailRegistrationValidateMutation()

  const [code, _setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { emailRegistrationId, email } = route.params

  const send = useCallback(
    async (code: string) => {
      try {
        setLoading(true)

        const res = await emailVerify({
          variables: { input: { code, emailRegistrationId } },
        })

        if (res.data?.userEmailRegistrationValidate.errors) {
          const error = res.data.userEmailRegistrationValidate.errors[0]?.message
          // TODO: manage translation for errors
          setErrorMessage(error)
        }

        if (res.data?.userEmailRegistrationValidate.me?.email?.verified) {
          Alert.alert(
            LL.common.success(),
            LL.EmailRegistrationValidateScreen.success({ email }),
            [
              {
                text: LL.common.ok(),
                onPress: () => {
                  navigation.navigate("accountScreen")
                },
              },
            ],
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    [emailVerify, emailRegistrationId, navigation, LL, email],
  )

  const setCode = (code: string) => {
    if (code.length > 6) {
      return
    }

    setErrorMessage("")
    _setCode(code)
    if (code.length === 6) {
      send(code)
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
          <Text type="h2">{LL.EmailRegistrationValidateScreen.header({ email })}</Text>
        </View>

        <Input
          placeholder="000000"
          containerStyle={styles.inputComponentContainerStyle}
          inputContainerStyle={styles.inputContainerStyle}
          inputStyle={styles.inputStyle}
          value={code}
          onChangeText={setCode}
          renderErrorMessage={false}
          autoFocus={true}
          textContentType={"oneTimeCode"}
          keyboardType="numeric"
        />
        {errorMessage && (
          <View style={styles.errorContainer}>
            <GaloyErrorBox errorMessage={errorMessage} />
          </View>
        )}
        {loading && (
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
            color={colors.primary}
          />
        )}
      </View>
    </Screen>
  )
}
