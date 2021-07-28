/* eslint-disable react-native/no-inline-styles */
import * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  EventSubscription,
  KeyboardAvoidingView,
  NativeEventEmitter,
  NativeModules,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native"
import { Button, Input } from "react-native-elements"
import {
  FetchResult,
  gql,
  useApolloClient,
  useLazyQuery,
  useMutation,
} from "@apollo/client"
import EStyleSheet from "react-native-extended-stylesheet"
import PhoneInput from "react-native-phone-input"
import analytics from "@react-native-firebase/analytics"
import { StackNavigationProp } from "@react-navigation/stack"

import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { queryMain } from "../../graphql/query"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import useToken from "../../utils/use-token"
import { toastShow } from "../../utils/toast"
import { addDeviceToken } from "../../utils/notifications"
import BiometricWrapper from "../../utils/biometricAuthentication"
import type { ScreenType } from "../../types/jsx"
import { AuthenticationScreenPurpose } from "../../utils/enum"
import BadgerPhone from "./badger-phone-01.svg"
import type { PhoneValidationStackParamList } from "../../navigation/stack-param-lists"
import { RouteProp } from "@react-navigation/native"
import { login_login } from "./__generated__/login"
import GeeTestModule from "../../native-modules/GeeTestModule"
import { registerCaptcha } from "./__generated__/registerCaptcha"

const REGISTER_CAPTCHA = gql`
  query registerCaptcha {
    registerCaptchaGeetest {
      success
      gt
      challenge
      new_captcha
    }
  }
`

const REQUEST_PHONE_CODE = gql`
  mutation requestPhoneCode(
    $phone: String
    $captchaChallenge: String
    $captchaValidate: String
    $captchaSeccode: String
  ) {
    requestPhoneCodeGeetest(
      phone: $phone
      captchaChallenge: $captchaChallenge
      captchaValidate: $captchaValidate
      captchaSeccode: $captchaSeccode
    ) {
      success
    }
  }
`

const LOGIN = gql`
  mutation userLogin($input: UserLoginInput!) {
    userLogin(input: $input) {
      errors {
        message
      }
      authToken
    }
  }
`

type MutationError = {
  message: string
}

type UserLoginMutationResponse = {
  errors: MutationError[]
  authToken?: string
}

type LoginMutationFunction = (
  params,
) => Promise<FetchResult<Record<string, UserLoginMutationResponse>>>

const styles = EStyleSheet.create({
  button: {
    backgroundColor: color.palette.blue,
    marginHorizontal: "50rem",
    marginTop: "30rem",
  },

  buttonStyle: {
    backgroundColor: color.primary,
  },

  codeContainer: {
    alignSelf: "center",
    width: "70%",
  },

  image: {
    alignSelf: "center",
    marginBottom: "30rem",
    resizeMode: "center",
  },

  phoneEntryContainer: {
    borderColor: color.palette.darkGrey,
    borderRadius: 5,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: "50rem",
    marginVertical: "18rem",
    paddingHorizontal: "18rem",
    paddingVertical: "12rem",
  },

  sendAgainButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: "25rem",
    textAlign: "center",
  },

  text: {
    fontSize: "20rem",
    paddingBottom: "10rem",
    paddingHorizontal: "40rem",
    textAlign: "center",
  },

  textDisabledSendAgain: {
    color: color.palette.midGrey,
  },

  textEntry: {
    color: color.palette.darkGrey,
    fontSize: "18rem",
  },

  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: "25rem",
    textAlign: "center",
  },
})

type WelcomePhoneInputScreenProps = {
  navigation: StackNavigationProp<PhoneValidationStackParamList, "welcomePhoneInput">
}

type GeeTestValidationData = {
  geeTestChallenge: string
  geeTestSecCode: string
  geeTestValidate: string
}

export const WelcomePhoneInputScreen: ScreenType = ({
  navigation,
}: WelcomePhoneInputScreenProps) => {
  const [
    queryRegisterCaptcha,
    { loading: loadingRegisterCaptcha, data: registerCaptchaData },
  ] = useLazyQuery<registerCaptcha>(REGISTER_CAPTCHA, {
    fetchPolicy: "network-only",
  })

  const [requestPhoneCode, { loading }] = useMutation(REQUEST_PHONE_CODE, {
    fetchPolicy: "no-cache",
  })

  const [geeTestValidationData, setGeeTestValidationData] =
    useState<GeeTestValidationData | null>(null)

  const onGeeTestDialogResultListener = React.useRef<EventSubscription>()
  const onGeeTestSuccessListener = React.useRef<EventSubscription>()
  const onGeeTestFailedListener = React.useRef<EventSubscription>()

  useEffect(() => {
    GeeTestModule.setUp()

    const eventEmitter = new NativeEventEmitter(NativeModules.GeeTestModule)

    onGeeTestDialogResultListener.current = eventEmitter.addListener(
      "GT3BaseListener-->onDialogResult-->",
      (event) => {
        const parsedDialogResult = JSON.parse(event.result)
        setGeeTestValidationData({
          geeTestChallenge: parsedDialogResult.geetest_challenge,
          geeTestSecCode: parsedDialogResult.geetest_seccode,
          geeTestValidate: parsedDialogResult.geetest_validate,
        })
      },
    )

    onGeeTestSuccessListener.current = eventEmitter.addListener(
      "GT3BaseListener-->onSuccess-->",
      (event) => {
        console.log("GT3BaseListener-->onSuccess-->", event.result)
      },
    )

    onGeeTestFailedListener.current = eventEmitter.addListener(
      "GT3BaseListener-->onFailed-->",
      (event) => {
        console.log("GT3BaseListener-->onFailed->", event.error)
        toastShow(event.error)
      },
    )

    return () => {
      GeeTestModule.tearDown()

      onGeeTestDialogResultListener.current.remove()
      onGeeTestSuccessListener.current.remove()
      onGeeTestFailedListener.current.remove()
    }
  }, [queryRegisterCaptcha])

  useEffect(() => {
    if (registerCaptchaData?.registerCaptchaGeetest) {
      const params = {
        success: registerCaptchaData.registerCaptchaGeetest.success,
        challenge: registerCaptchaData.registerCaptchaGeetest.challenge,
        gt: registerCaptchaData.registerCaptchaGeetest.gt,
        new_captcha: registerCaptchaData.registerCaptchaGeetest.new_captcha,
      }
      GeeTestModule.handleRegisteredGeeTestCaptcha(JSON.stringify(params))
    }
  }, [registerCaptchaData])

  const inputRef = useRef<PhoneInput | null>()

  const send = useCallback(async () => {
    const phone = inputRef.current.getValue()
    const phoneRegex = new RegExp("^\\+[0-9]+$")

    if (!inputRef.current.isValidNumber() || !phoneRegex.test(phone)) {
      Alert.alert(`${phone} ${translate("errors.invalidPhoneNumber")}`)
      return
    }

    try {
      const { data } = await requestPhoneCode({
        variables: {
          phone,
          captchaChallenge: geeTestValidationData.geeTestChallenge,
          captchaValidate: geeTestValidationData.geeTestValidate,
          captchaSeccode: geeTestValidationData.geeTestSecCode,
        },
      })
      if (data.requestPhoneCodeGeetest.success) {
        navigation.navigate("welcomePhoneValidation", { phone })
      } else {
        toastShow(translate("errors.generic"))
      }
    } catch (err) {
      console.warn({ err })
      if (err.message === "Too many requests") {
        toastShow(translate("errors.tooManyRequestsPhoneCode"))
      } else {
        toastShow(translate("errors.generic"))
      }
    }
  }, [navigation, requestPhoneCode])

  return (
    <Screen backgroundColor={palette.lighterGrey} preset="scroll">
      <View style={{ flex: 1, justifyContent: "space-around" }}>
        <View>
          <BadgerPhone style={styles.image} />
          <Text style={styles.text}>
            {geeTestValidationData !== null
              ? translate("WelcomePhoneInputScreen.header")
              : translate("WelcomePhoneInputScreen.headerVerify")}
          </Text>
        </View>
        {geeTestValidationData !== null ? (
          <KeyboardAvoidingView>
            <PhoneInput
              ref={inputRef}
              style={styles.phoneEntryContainer}
              textStyle={styles.textEntry}
              initialCountry="sv"
              textProps={{
                autoFocus: true,
                placeholder: translate("WelcomePhoneInputScreen.placeholder"),
                returnKeyType: loading ? "default" : "done",
                onSubmitEditing: send,
              }}
            />
            <ActivityIndicator
              animating={loading}
              size="large"
              color={color.primary}
              style={{ marginTop: 32 }}
            />
          </KeyboardAvoidingView>
        ) : (
          <Button
            title={translate("WelcomePhoneInputScreen.verify")}
            onPress={() => queryRegisterCaptcha()}
            loading={loadingRegisterCaptcha}
            buttonStyle={styles.button}
          />
        )}
      </View>
      <CloseCross color={palette.darkGrey} onPress={() => navigation.goBack()} />
    </Screen>
  )
}

type WelcomePhoneValidationScreenDataInjectedProps = {
  navigation: StackNavigationProp<PhoneValidationStackParamList, "welcomePhoneValidation">
  route: RouteProp<PhoneValidationStackParamList, "welcomePhoneValidation">
}

export const WelcomePhoneValidationScreenDataInjected: ScreenType = ({
  route,
  navigation,
}: WelcomePhoneValidationScreenDataInjectedProps) => {
  const client = useApolloClient()
  const { saveToken, hasToken } = useToken()

  const [login, { loading, error }] = useMutation<{
    login: LoginMutationFunction
  }>(LOGIN, {
    fetchPolicy: "no-cache",
  })

  const onSuccess = async ({ token }) => {
    analytics().logLogin({ method: "phone" })
    await saveToken(token)

    // TODO refactor from mst-gql to apollo client
    // sync the earned quizzes
    // const ids = map(filter(values(self.earns), {completed: true}), "id")
    // yield self.mutateEarnCompleted({ids})

    // console.log("succesfully update earns id")

    queryMain(client, { logged: hasToken })

    addDeviceToken(client)
  }

  return (
    <WelcomePhoneValidationScreen
      onSuccess={onSuccess}
      route={route}
      navigation={navigation}
      login={login}
      loading={loading}
      error={error}
    />
  )
}

type WelcomePhoneValidationScreenProps = {
  login: LoginMutationFunction
  onSuccess: (params) => void
  navigation: StackNavigationProp<PhoneValidationStackParamList, "welcomePhoneValidation">
  route: RouteProp<PhoneValidationStackParamList, "welcomePhoneValidation">
  loading: boolean
  error: string
}

export const WelcomePhoneValidationScreen: ScreenType = ({
  onSuccess,
  route,
  navigation,
  login,
  error,
}: WelcomePhoneValidationScreenProps) => {
  // FIXME see what to do with store and storybook
  const [code, setCode] = useState("")
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60)

  const { phone } = route.params
  const updateCode = (input) => setCode(input)

  const [requestPhoneCode, { loading }] = useMutation(REQUEST_AUTH_CODE, {
    fetchPolicy: "no-cache",
  })

  const sendCodeAgain = useCallback(async () => {
    try {
      const { data } = await requestPhoneCode({ variables: { input: { phone } } })
      if (data.userRequestAuthCode.success) {
        setSecondsRemaining(60)
      } else {
        toastShow(translate("errors.generic"))
      }
    } catch (err) {
      console.warn({ err })
      if (err.message === "Too many requests") {
        toastShow(translate("errors.tooManyRequestsPhoneCode"))
      } else {
        toastShow(translate("errors.generic"))
      }
    }
  }, [phone, requestPhoneCode])

  const send = async () => {
    if (code.length !== 6) {
      toastShow(translate("WelcomePhoneValidationScreen.need6Digits"))
      return
    }

    try {
      const { data } = await login({
        variables: { input: { phone, code: code } },
      })

      // TODO: validate token
      const token = data?.userLogin?.authToken

      if (token) {
        await onSuccess({ token })
        if (await BiometricWrapper.isSensorAvailable()) {
          navigation.replace("authentication", {
            screenPurpose: AuthenticationScreenPurpose.TurnOnAuthentication,
          })
        } else {
          navigation.navigate("moveMoney")
        }
      } else {
        toastShow(translate("WelcomePhoneValidationScreen.errorLoggingIn"))
      }
    } catch (err) {
      console.warn({ err })
      toastShow(`${err}`)
    }
  }

  useEffect(() => {
    if (code.length === 6) {
      send()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

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
      <View style={{ flex: 1 }}>
        <ScrollView>
          <View style={{ flex: 1, minHeight: 32 }} />
          <Text style={styles.text}>
            {translate("WelcomePhoneValidationScreen.header", { phone })}
          </Text>
          <KeyboardAvoidingView
            keyboardVerticalOffset={-110}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <Input
              errorStyle={{ color: palette.red }}
              errorMessage={error}
              autoFocus
              style={styles.phoneEntryContainer}
              containerStyle={styles.codeContainer}
              onChangeText={updateCode}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              placeholder={translate("WelcomePhoneValidationScreen.placeholder")}
              returnKeyType={loading ? "default" : "done"}
              maxLength={6}
              onSubmitEditing={send}
            >
              {code}
            </Input>
            {secondsRemaining > 0 ? (
              <View style={styles.timerRow}>
                <Text style={styles.textDisabledSendAgain}>
                  {translate("WelcomePhoneValidationScreen.sendAgain")}
                </Text>
                <Text>{parseTimer(secondsRemaining)}</Text>
              </View>
            ) : (
              <View style={styles.sendAgainButtonRow}>
                <Button
                  buttonStyle={styles.buttonStyle}
                  title={translate("WelcomePhoneValidationScreen.sendAgain")}
                  onPress={() => {
                    if (!loading) {
                      sendCodeAgain()
                    }
                  }}
                  disabled={loading}
                />
              </View>
            )}
          </KeyboardAvoidingView>
          <View style={{ flex: 1, minHeight: 16 }} />
          <ActivityIndicator animating={loading} size="large" color={color.primary} />
          <View style={{ flex: 1 }} />
        </ScrollView>
      </View>
    </Screen>
  )
}
