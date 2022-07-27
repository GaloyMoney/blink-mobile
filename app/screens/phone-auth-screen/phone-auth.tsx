/* eslint-disable react-native/no-inline-styles */
import * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native"
import { Button, Input } from "react-native-elements"
import { FetchResult, useApolloClient } from "@apollo/client"
import EStyleSheet from "react-native-extended-stylesheet"
import PhoneInput from "react-native-phone-number-input"
import analytics from "@react-native-firebase/analytics"
import { StackNavigationProp } from "@react-navigation/stack"
import { RouteProp } from "@react-navigation/native"

import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"
import { translateUnknown as translate, useMutation } from "@galoymoney/client"
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
import { parseTimer } from "../../utils/timer"
import { useGeetestCaptcha } from "../../hooks"
import { networkVar } from "../../graphql/client-only-query"
import DownArrow from "@app/assets/icons/downarrow.svg"

const phoneRegex = new RegExp("^\\+[0-9]+$")

type UserLoginMutationResponse = {
  errors: MutationError[]
  authToken?: string
}

type LoginMutationFunction = (
  params,
) => Promise<FetchResult<Record<string, UserLoginMutationResponse>>>

const styles = EStyleSheet.create({
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

  buttonContinue: {
    alignSelf: "center",
    backgroundColor: color.palette.blue,
    width: "200rem",
    marginVertical: "15rem",
    padding: "15rem",
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
    marginHorizontal: "40rem",
    marginVertical: "18rem",
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

  textContainer: {
    backgroundColor: color.transparent,
  },

  textDisabledSendAgain: {
    color: color.palette.midGrey,
  },

  textEntry: {
    color: color.palette.darkGrey,
    fontSize: "16rem",
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

export const WelcomePhoneInputScreen: ScreenType = ({
  navigation,
}: WelcomePhoneInputScreenProps) => {
  const {
    geetestError,
    geetestValidationData,
    loadingRegisterCaptcha,
    registerCaptcha,
    resetError,
    resetValidationData,
  } = useGeetestCaptcha()

  const [phoneNumber, setPhoneNumber] = useState("")

  const phoneInputRef = useRef<PhoneInput | null>()

  const [captchaRequestAuthCode, { loading: loadingRequestPhoneCode }] =
    useMutation.captchaRequestAuthCode({
      fetchPolicy: "no-cache",
    })

  const setPhone = (newPhoneNumber: string) => {
    setPhoneNumber(newPhoneNumber)
  }

  // This bypasses the captcha for local dev
  // Comment it out to test captcha locally
  useEffect(() => {
    if (phoneNumber) {
      if (networkVar() === "regtest") {
        navigation.navigate("welcomePhoneValidation", { phone: phoneNumber, setPhone })
        setPhoneNumber("")
      } else {
        registerCaptcha()
      }
    }
  }, [navigation, phoneNumber, registerCaptcha])

  const sendRequestAuthCode = useCallback(async () => {
    try {
      const input = {
        phone: phoneNumber,
        challengeCode: geetestValidationData?.geetestChallenge,
        validationCode: geetestValidationData?.geetestValidate,
        secCode: geetestValidationData?.geetestSecCode,
      }
      resetValidationData()

      const { data } = await captchaRequestAuthCode({ variables: { input } })

      if (data.captchaRequestAuthCode.success) {
        navigation.navigate("welcomePhoneValidation", { phone: phoneNumber, setPhone })
        setPhoneNumber("")
      } else if (data.captchaRequestAuthCode.errors.length > 0) {
        const errorMessage = data.captchaRequestAuthCode.errors[0].message
        if (errorMessage === "Too many requests") {
          toastShow({ message: translate("errors.tooManyRequestsPhoneCode") })
        } else {
          toastShow({ message: errorMessage })
        }
      } else {
        toastShow({ message: translate("errors.generic") })
      }
    } catch (err) {
      console.debug({ err })
      if (err.message === "Too many requests") {
        toastShow({ message: translate("errors.tooManyRequestsPhoneCode") })
      } else {
        toastShow({ message: translate("errors.generic") })
      }
    }
  }, [
    geetestValidationData,
    navigation,
    phoneNumber,
    captchaRequestAuthCode,
    resetValidationData,
  ])

  useEffect(() => {
    if (
      geetestValidationData?.geetestValidate &&
      geetestValidationData?.geetestChallenge &&
      geetestValidationData?.geetestSecCode
    ) {
      sendRequestAuthCode()
    }
  }, [geetestValidationData, sendRequestAuthCode])

  useEffect(() => {
    if (geetestError) {
      const error = geetestError
      resetError()
      toastShow({ message: error })
    }
  })

  const submitPhoneNumber = () => {
    const phone = phoneInputRef.current.state.number

    const formattedNumber = phoneInputRef.current.getNumberAfterPossiblyEliminatingZero()

    const cleanFormattedNumber = formattedNumber.formattedNumber.replace(/[^\d+]/g, "")

    if (
      !phoneInputRef.current.isValidNumber(phone) ||
      !phoneRegex.test(cleanFormattedNumber)
    ) {
      Alert.alert(`${phone} ${translate("errors.invalidPhoneNumber")}`)
      return
    }

    setPhoneNumber(cleanFormattedNumber)
  }

  const showCaptcha = phoneNumber.length > 0
  let captchaContent: JSX.Element

  if (loadingRegisterCaptcha || loadingRequestPhoneCode) {
    captchaContent = <ActivityIndicator size="large" color={color.primary} />
  } else {
    captchaContent = null
  }

  const renderDropdownImage = () => {
    return <DownArrow testID="DropDownButton" width={12} height={14} />
  }

  return (
    <Screen backgroundColor={palette.lighterGrey} preset="scroll">
      <View style={{ flex: 1, justifyContent: "space-around", marginTop: 50 }}>
        <View>
          <BadgerPhone style={styles.image} />
          <Text style={styles.text}>
            {showCaptcha
              ? translate("WelcomePhoneInputScreen.headerVerify")
              : translate("WelcomePhoneInputScreen.header")}
          </Text>
        </View>
        {showCaptcha ? (
          captchaContent
        ) : (
          <KeyboardAvoidingView>
            <PhoneInput
              ref={phoneInputRef}
              value={phoneNumber}
              containerStyle={styles.phoneEntryContainer}
              textInputStyle={styles.textEntry}
              textContainerStyle={styles.textContainer}
              defaultValue={phoneNumber}
              defaultCode="SV"
              layout="first"
              renderDropdownImage={renderDropdownImage()}
              textInputProps={{
                placeholder: translate("WelcomePhoneInputScreen.placeholder"),
                returnKeyType: loadingRequestPhoneCode ? "default" : "done",
                onSubmitEditing: submitPhoneNumber,
                keyboardType: "phone-pad",
                textContentType: "telephoneNumber",
                accessibilityLabel: "Input phone number",
              }}
              countryPickerProps={{
                modalProps: {
                  testID: "country-picker",
                },
              }}
              codeTextStyle={{ marginLeft: -25 }}
              autoFocus
            />
            <ActivityIndicator
              animating={loadingRequestPhoneCode}
              size="large"
              color={color.primary}
              style={{ marginTop: 32 }}
            />
          </KeyboardAvoidingView>
        )}
        <Button
          buttonStyle={styles.buttonContinue}
          title={translate("WelcomePhoneInputScreen.continue")}
          disabled={Boolean(phoneNumber)}
          onPress={() => {
            submitPhoneNumber()
          }}
        />
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
  const { saveToken, hasToken } = useToken()

  const [userLogin, { loading, error }] = useMutation.userLogin({
    fetchPolicy: "no-cache",
    onCompleted: async (data) => {
      if (data.userLogin.authToken) {
        if (await BiometricWrapper.isSensorAvailable()) {
          navigation.replace("authentication", {
            screenPurpose: AuthenticationScreenPurpose.TurnOnAuthentication,
          })
        } else {
          navigation.navigate("Primary")
        }
      }
    },
  })

  return (
    <WelcomePhoneValidationScreen
      route={route}
      navigation={navigation}
      login={userLogin}
      loading={loading || hasToken}
      // Todo: provide specific translated error messages in known cases
      error={error?.message ? translate("errors.generic") + error.message : ""}
      saveToken={saveToken}
    />
  )
}

type WelcomePhoneValidationScreenProps = {
  login: LoginMutationFunction
  navigation: StackNavigationProp<PhoneValidationStackParamList, "welcomePhoneValidation">
  route: RouteProp<PhoneValidationStackParamList, "welcomePhoneValidation">
  loading: boolean
  error: string
  saveToken: (string) => Promise<boolean>
}

export const WelcomePhoneValidationScreen: ScreenType = ({
  route,
  navigation,
  loading,
  login,
  error,
  saveToken,
}: WelcomePhoneValidationScreenProps) => {
  const client = useApolloClient()
  const [code, setCode] = useState("")
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60)

  const { phone } = route.params
  const updateCode = (input) => setCode(input)
  const inputRef = useRef<TextInput>()

  useEffect(() => {
    setTimeout(() => inputRef?.current?.focus(), 150)
  }, [])

  const send = useCallback(async () => {
    if (loading) {
      return
    }
    if (code.length !== 6) {
      throw new Error(translate("WelcomePhoneValidationScreen.need6Digits"))
    }

    try {
      const { data } = await login({
        variables: { input: { phone, code } },
      })

      // TODO: validate token
      const token = data?.userLogin?.authToken

      if (token) {
        analytics().logLogin({ method: "phone" })
        await saveToken(token)
        await addDeviceToken(client)
      } else {
        throw new Error(translate("WelcomePhoneValidationScreen.errorLoggingIn"))
      }
    } catch (err) {
      console.debug({ err })
      setCode("")
      toastShow({ message: `${err}` })
    }
  }, [client, code, loading, login, phone, saveToken])

  useEffect(() => {
    if (code.length === 6) {
      send()
    }
  }, [code, send])

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
              ref={inputRef}
              errorStyle={{ color: palette.red }}
              errorMessage={error}
              autoFocus={true}
              style={styles.authCodeEntryContainer}
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
                  buttonStyle={styles.buttonResend}
                  title={translate("WelcomePhoneValidationScreen.sendAgain")}
                  onPress={() => {
                    if (!loading) {
                      route.params?.setPhone(phone)
                      navigation.goBack()
                    }
                  }}
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
