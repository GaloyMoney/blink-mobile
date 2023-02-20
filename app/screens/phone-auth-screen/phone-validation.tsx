import { gql } from "@apollo/client"
import analytics from "@react-native-firebase/analytics"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Button, Input } from "@rneui/base"
import * as React from "react"
import { LegacyRef, Ref, useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

import { useUserLoginMutation } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import crashlytics from "@react-native-firebase/crashlytics"
import { Screen } from "../../components/screen"
import { useAppConfig } from "../../hooks"
import type { PhoneValidationStackParamList } from "../../navigation/stack-param-lists"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import BiometricWrapper from "../../utils/biometricAuthentication"
import { AuthenticationScreenPurpose } from "../../utils/enum"
import { parseTimer } from "../../utils/timer"
import { toastShow } from "../../utils/toast"

const styles = EStyleSheet.create({
  flex: { flex: 1 },
  flexAndMinHeight: { flex: 1, minHeight: 16 },

  authCodeEntryContainer: {
    borderColor: color.palette.darkGrey,
    borderRadius: 5,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: "50rem",
    marginVertical: "18rem",
    paddingHorizontal: "18rem",
    paddingVertical: "12rem",
  },

  buttonResend: {
    alignSelf: "center",
    backgroundColor: color.palette.blue,
    width: "200rem",
  },

  codeContainer: {
    alignSelf: "center",
    width: "70%",
  },

  sendAgainButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: "25rem",
    textAlign: "center",
  },

  text: {
    color: color.palette.darkGrey,
    fontSize: "20rem",
    paddingBottom: "10rem",
    paddingHorizontal: "40rem",
    textAlign: "center",
  },

  textDisabledSendAgain: {
    color: color.palette.midGrey,
  },

  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: "25rem",
    textAlign: "center",
  },
})

gql`
  mutation userLogin($input: UserLoginInput!) {
    userLogin(input: $input) {
      errors {
        message
      }
      authToken
    }
  }
`

type PhoneValidationScreenProps = {
  route: RouteProp<PhoneValidationStackParamList, "phoneValidation">
}

export const PhoneValidationScreen: React.FC<PhoneValidationScreenProps> = ({
  route,
}) => {
  const navigation =
    useNavigation<StackNavigationProp<PhoneValidationStackParamList, "phoneValidation">>()

  const { saveToken } = useAppConfig()

  const { LL } = useI18nContext()
  const [userLoginMutation, { loading, error }] = useUserLoginMutation({
    fetchPolicy: "no-cache",
  })

  const userLogin = userLoginMutation
  const errorWrapped = error?.message ? LL.errors.generic() + error.message : ""

  const [code, setCode] = useState("")
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60)
  const { phone } = route.params
  const inputRef: LegacyRef<Input> & Ref<TextInput> = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef?.current?.focus(), 150)
  }, [])

  const send = useCallback(
    async (code: string) => {
      if (loading) {
        return
      }
      if (code.length !== 6) {
        throw new Error(LL.PhoneValidationScreen.need6Digits())
      }

      try {
        const { data } = await userLogin({
          variables: { input: { phone, code } },
        })

        const token = data?.userLogin?.authToken

        if (token) {
          analytics().logLogin({ method: "phone" })
          saveToken(token)

          if (await BiometricWrapper.isSensorAvailable()) {
            navigation.replace("authentication", {
              screenPurpose: AuthenticationScreenPurpose.TurnOnAuthentication,
            })
          } else {
            navigation.replace("Primary")
          }
        } else {
          setCode("")
          toastShow({
            message: (translations) =>
              translations.PhoneValidationScreen.errorLoggingIn(),
            currentTranslation: LL,
          })
        }
      } catch (err) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          console.debug({ err })
        }
      }
    },
    [loading, userLogin, phone, saveToken, setCode, LL, navigation],
  )

  const updateCode = (code: string) => {
    setCode(code)
    if (code.length === 6) {
      send(code)
    }
  }

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (secondsRemaining > 0) {
        setSecondsRemaining(secondsRemaining - 1)
      }
    }, 1000)
    return () => clearTimeout(timerId)
  }, [secondsRemaining])

  return (
    <Screen backgroundColor={palette.lighterGrey}>
      <View style={styles.flex}>
        <ScrollView>
          <View style={styles.flexAndMinHeight} />
          <Text style={styles.text}>
            {LL.PhoneValidationScreen.header({ phoneNumber: phone })}
          </Text>
          <KeyboardAvoidingView
            keyboardVerticalOffset={-110}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.flex}
          >
            <Input
              ref={inputRef}
              errorStyle={{ color: palette.red }}
              errorMessage={errorWrapped}
              autoFocus={true}
              style={styles.authCodeEntryContainer}
              containerStyle={styles.codeContainer}
              onChangeText={updateCode}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              placeholder={LL.PhoneValidationScreen.placeholder()}
              returnKeyType={loading ? "default" : "done"}
              maxLength={6}
            >
              {code}
            </Input>
            {secondsRemaining > 0 ? (
              <View style={styles.timerRow}>
                <Text style={styles.textDisabledSendAgain}>
                  {LL.PhoneValidationScreen.sendAgain()}
                </Text>
                <Text>{parseTimer(secondsRemaining)}</Text>
              </View>
            ) : (
              <View style={styles.sendAgainButtonRow}>
                <Button
                  buttonStyle={styles.buttonResend}
                  title={LL.PhoneValidationScreen.sendAgain()}
                  onPress={() => {
                    if (!loading) {
                      navigation.goBack()
                    }
                  }}
                />
              </View>
            )}
          </KeyboardAvoidingView>
          <View style={styles.flexAndMinHeight} />
          <ActivityIndicator animating={loading} size="large" color={color.primary} />
          <View style={styles.flex} />
        </ScrollView>
      </View>
    </Screen>
  )
}
