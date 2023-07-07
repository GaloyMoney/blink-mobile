import { GaloyErrorBox } from "@app/components/atomic/galoy-error-box"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { RouteProp, useNavigation, useTheme } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Input, Text, makeStyles } from "@rneui/themed"
import axios from "axios"
import * as React from "react"
import { useCallback, useState } from "react"
import { ActivityIndicator, View } from "react-native"
import { Screen } from "../../components/screen"
import analytics from "@react-native-firebase/analytics"

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

type EmailLoginValidationScreenProps = {
  route: RouteProp<RootStackParamList, "emailLoginValidation">
}

export const EmailLoginValidationScreen: React.FC<EmailLoginValidationScreenProps> = ({
  route,
}) => {
  const styles = useStyles()
  const { colors } = useTheme()
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "emailLoginValidation">>()

  const [errorMessage, setErrorMessage] = React.useState<string>("")

  const {
    appConfig: {
      galoyInstance: { authUrl },
    },
  } = useAppConfig()

  const { LL } = useI18nContext()
  const { saveToken } = useAppConfig()

  const [code, _setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { flow, email } = route.params

  const send = useCallback(
    async (code: string) => {
      try {
        setLoading(true)

        const urlEmailLogin = `${authUrl}/auth/email/login`

        const res2 = await axios({
          url: urlEmailLogin,
          method: "POST",
          data: {
            code,
            flow,
          },
        })

        const sessionToken = res2.data.result.sessionToken
        console.log("sessionToken", sessionToken)

        if (sessionToken) {
          analytics().logLogin({ method: "email" })
          saveToken(sessionToken)
          navigation.replace("Primary")
        }
      } catch (err) {
        console.error(err, "error axios")
      } finally {
        setLoading(false)
      }
    },
    [flow, navigation, authUrl, saveToken],
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
          <Text type="h2">{LL.EmailLoginValidationScreen.header({ email })}</Text>
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
