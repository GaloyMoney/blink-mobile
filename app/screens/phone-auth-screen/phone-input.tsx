import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Button } from "@rneui/base"
import * as React from "react"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  Alert,
  KeyboardAvoidingView,
  Text,
  View,
} from "react-native"
import PhoneInput from "react-native-phone-number-input"

import DownArrow from "@app/assets/icons/downarrow.svg"
import { useCaptchaRequestAuthCodeMutation } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { logRequestAuthCode } from "@app/utils/analytics"
import crashlytics from "@react-native-firebase/crashlytics"
import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"
import { useAppConfig, useGeetestCaptcha } from "../../hooks"
import type { PhoneValidationStackParamList } from "../../navigation/stack-param-lists"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { toastShow } from "../../utils/toast"
import BadgerPhone from "./badger-phone-01.svg"
import EStyleSheet from "react-native-extended-stylesheet"
import { gql } from "@apollo/client"

const phoneRegex = new RegExp("^\\+[0-9]+$")

const styles = EStyleSheet.create({
  buttonContinue: {
    alignSelf: "center",
    backgroundColor: color.palette.blue,
    width: "200rem",
    marginVertical: "15rem",
    padding: "15rem",
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

  textEntry: {
    color: color.palette.darkGrey,
    fontSize: "16rem",
  },
})

gql`
  mutation captchaRequestAuthCode($input: CaptchaRequestAuthCodeInput!) {
    captchaRequestAuthCode(input: $input) {
      errors {
        message
      }
      success
    }
  }
`

export const WelcomePhoneInputScreen: React.FC = () => {
  const {
    geetestError,
    geetestValidationData,
    loadingRegisterCaptcha,
    registerCaptcha,
    resetError,
    resetValidationData,
  } = useGeetestCaptcha()

  const navigation =
    useNavigation<
      StackNavigationProp<PhoneValidationStackParamList, "welcomePhoneInput">
    >()

  const { LL } = useI18nContext()

  const [phoneNumber, setPhoneNumber] = useState("")
  const { appConfig } = useAppConfig()

  const phoneInputRef = useRef<PhoneInput | null>(null)

  const [captchaRequestAuthCode, { loading: loadingRequestPhoneCode }] =
    useCaptchaRequestAuthCodeMutation({
      fetchPolicy: "no-cache",
    })

  const setPhone = (newPhoneNumber: string) => {
    setPhoneNumber(newPhoneNumber)
  }

  useEffect(() => {
    if (phoneNumber) {
      // This bypasses the captcha for local dev
      // Comment it out to test captcha locally
      if (appConfig.galoyInstance.name === "Local") {
        navigation.navigate("welcomePhoneValidation", { phone: phoneNumber, setPhone })
        setPhoneNumber("")
      } else {
        registerCaptcha()
      }
    }
  }, [appConfig.galoyInstance.name, navigation, phoneNumber, registerCaptcha])

  useEffect(() => {
    if (geetestValidationData) {
      const sendRequestAuthCode = async () => {
        try {
          const input = {
            phone: phoneNumber,
            challengeCode: geetestValidationData?.geetestChallenge,
            validationCode: geetestValidationData?.geetestValidate,
            secCode: geetestValidationData?.geetestSecCode,
          }
          resetValidationData()
          logRequestAuthCode(appConfig.galoyInstance.name)

          const { data } = await captchaRequestAuthCode({ variables: { input } })

          if (!data) {
            toastShow({
              message: (translations) => translations.errors.generic(),
              currentTranslation: LL,
            })
            return
          }

          if (data.captchaRequestAuthCode.success) {
            navigation.navigate("welcomePhoneValidation", {
              phone: phoneNumber,
              setPhone,
            })
            setPhoneNumber("")
          } else if ((data?.captchaRequestAuthCode?.errors?.length || 0) > 0) {
            const errorMessage = data.captchaRequestAuthCode.errors[0].message
            if (errorMessage === "Too many requests") {
              toastShow({
                message: (translations) => translations.errors.tooManyRequestsPhoneCode(),
                currentTranslation: LL,
              })
            } else {
              toastShow({ message: errorMessage })
            }
          } else {
            toastShow({
              message: (translations) => translations.errors.generic(),
              currentTranslation: LL,
            })
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            crashlytics().recordError(err)
            console.debug({ err })
            toastShow({
              message: (translations) => translations.errors.generic(),
              currentTranslation: LL,
            })
          }
        }
      }
      sendRequestAuthCode()
    }
  }, [
    geetestValidationData,
    navigation,
    phoneNumber,
    setPhoneNumber,
    captchaRequestAuthCode,
    resetValidationData,
    appConfig.galoyInstance.name,
    LL,
  ])

  useEffect(() => {
    if (geetestError) {
      const error = geetestError
      resetError()
      toastShow({ message: error })
    }
  })

  const submitPhoneNumber = () => {
    if (!phoneInputRef.current) {
      return
    }

    const phone = phoneInputRef.current.state.number

    const formattedNumber = phoneInputRef.current.getNumberAfterPossiblyEliminatingZero()

    const cleanFormattedNumber = formattedNumber.formattedNumber.replace(/[^\d+]/g, "")

    if (
      !phoneInputRef.current.isValidNumber(phone) ||
      !phoneRegex.test(cleanFormattedNumber)
    ) {
      Alert.alert(`${phone} ${LL.errors.invalidPhoneNumber()}`)
      return
    }

    setPhoneNumber(cleanFormattedNumber)
  }

  const showCaptcha = phoneNumber.length > 0
  let captchaContent: ReturnType<React.FC<ActivityIndicatorProps>> | null

  if (loadingRegisterCaptcha || loadingRequestPhoneCode) {
    captchaContent = <ActivityIndicator size="large" color={color.primary} />
  } else {
    captchaContent = null
  }

  return (
    <Screen backgroundColor={palette.lighterGrey} preset="scroll">
      <View style={{ flex: 1, justifyContent: "space-around", marginTop: 50 }}>
        <View>
          <BadgerPhone style={styles.image} />
          <Text style={styles.text}>
            {showCaptcha
              ? LL.WelcomePhoneInputScreen.headerVerify()
              : LL.WelcomePhoneInputScreen.header()}
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
              renderDropdownImage={
                <DownArrow testID="DropDownButton" width={12} height={14} />
              }
              textInputProps={{
                placeholder: LL.WelcomePhoneInputScreen.placeholder(),
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
          title={LL.WelcomePhoneInputScreen.continue()}
          disabled={Boolean(phoneNumber)}
          onPress={submitPhoneNumber}
        />
      </View>
      <CloseCross color={palette.darkGrey} onPress={() => navigation.goBack()} />
    </Screen>
  )
}
