import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Button } from "@rneui/base"
import * as React from "react"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  View,
  TouchableOpacity,
} from "react-native"
import PhoneInput from "react-native-phone-number-input"

import { gql } from "@apollo/client"
import DownArrow from "@app/assets/icons/downarrow.svg"
import {
  PhoneCodeChannelType,
  useCaptchaRequestAuthCodeMutation,
} from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { logRequestAuthCode } from "@app/utils/analytics"
import crashlytics from "@react-native-firebase/crashlytics"
import EStyleSheet from "react-native-extended-stylesheet"
import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"
import { useAppConfig, useGeetestCaptcha } from "../../hooks"
import type { PhoneValidationStackParamList } from "../../navigation/stack-param-lists"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { toastShow } from "../../utils/toast"
import BadgerPhone from "./badger-phone-01.svg"
import { ContactSupportButton } from "@app/components/contact-support-button/contact-support-button"
import { useDarkMode } from "@app/hooks/use-darkmode"

const phoneRegex = new RegExp("^\\+[0-9]+$")

const styles = EStyleSheet.create({
  buttonSms: {
    backgroundColor: color.palette.blue,
    width: "150rem",
    padding: "15rem",
    margin: "6rem",
  },

  buttons: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  whatsappContainer: {
    margin: "12rem",
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

  textLight: {
    color: color.palette.darkGrey,
    fontSize: "20rem",
    paddingBottom: "10rem",
    paddingHorizontal: "40rem",
    textAlign: "center",
  },
  textDark: {
    color: color.palette.white,
    fontSize: "20rem",
    paddingBottom: "10rem",
    paddingHorizontal: "40rem",
    textAlign: "center",
  },

  textWhatsappLight: {
    color: color.palette.darkGrey,
    fontSize: "18rem",
    textAlign: "center",
  },
  textWhatsappDark: {
    color: color.palette.white,
    fontSize: "18rem",
    textAlign: "center",
  },

  textContainer: {
    backgroundColor: color.transparent,
  },

  textEntry: {
    color: color.palette.darkGrey,
    fontSize: "16rem",
  },

  viewWrapper: { flex: 1, justifyContent: "space-around", marginTop: 50 },

  activityIndicator: { marginTop: 32 },

  codeTextStyle: { marginLeft: -25 },
  contactSupportContainer: {
    marginTop: 50,
    marginBottom: 20,
    alignItems: "center",
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

export const PhoneInputScreen: React.FC = () => {
  const darkMode = useDarkMode()

  const {
    geetestError,
    geetestValidationData,
    loadingRegisterCaptcha,
    registerCaptcha,
    resetError,
    resetValidationData,
  } = useGeetestCaptcha()

  const navigation =
    useNavigation<StackNavigationProp<PhoneValidationStackParamList, "phoneInput">>()

  const { LL } = useI18nContext()

  const [phoneNumber, setPhoneNumber] = useState("")
  const [channel, setChannel] = useState<PhoneCodeChannelType>("SMS")
  const { appConfig } = useAppConfig()

  const phoneInputRef = useRef<PhoneInput | null>(null)

  const [captchaRequestAuthCode, { loading: loadingRequestPhoneCode }] =
    useCaptchaRequestAuthCodeMutation({
      fetchPolicy: "no-cache",
    })

  useEffect(() => {
    if (phoneNumber) {
      if (appConfig.galoyInstance.name === "Local") {
        navigation.navigate("phoneValidation", {
          phone: phoneNumber,
        })
        return
      }
      registerCaptcha()
    }
  }, [registerCaptcha, phoneNumber, navigation, appConfig.galoyInstance.name])

  useEffect(() => {
    if (geetestValidationData) {
      const sendRequestAuthCode = async () => {
        try {
          const input = {
            phone: phoneNumber,
            challengeCode: geetestValidationData?.geetestChallenge,
            validationCode: geetestValidationData?.geetestValidate,
            secCode: geetestValidationData?.geetestSecCode,
            channel,
          } as const
          resetValidationData()
          logRequestAuthCode(appConfig.galoyInstance.id)

          const { data } = await captchaRequestAuthCode({ variables: { input } })

          if (!data) {
            toastShow({
              message: (translations) => translations.errors.generic(),
              currentTranslation: LL,
            })
            return
          }

          if (data.captchaRequestAuthCode.success) {
            navigation.navigate("phoneValidation", {
              phone: phoneNumber,
            })
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
    appConfig.galoyInstance.id,
    LL,
    channel,
  ])

  useEffect(() => {
    if (geetestError) {
      crashlytics().recordError(new Error(geetestError))
      toastShow({ message: LL.PhoneInputScreen.errorRequestingCaptcha() })
      resetError()
    }
  }, [geetestError, resetError, LL])

  const submitPhoneNumber = () => {
    if (!phoneInputRef.current) {
      return
    }

    const phone = phoneInputRef.current.state.number
    const formattedNumber = phoneInputRef.current.getNumberAfterPossiblyEliminatingZero()
    const cleanFormattedNumber = formattedNumber.formattedNumber.replace(/[^\d+]/g, "")

    if (
      (phone !== "" && !phoneInputRef.current.isValidNumber(phone)) ||
      !phoneRegex.test(cleanFormattedNumber)
    ) {
      Alert.alert(`${phone} ${LL.errors.invalidPhoneNumber()}`)
      return
    }
    if (phone === "") {
      return
    }

    setPhoneNumber(cleanFormattedNumber)
  }

  const submitViaWhatsapp = () => {
    setChannel("WHATSAPP")
    submitPhoneNumber()
  }

  const submitViaSms = () => {
    setChannel("SMS")
    submitPhoneNumber()
  }

  const showCaptcha = phoneNumber.length > 0

  let CaptchaContent: ReturnType<React.FC<ActivityIndicatorProps>> | null

  if (loadingRegisterCaptcha || loadingRequestPhoneCode) {
    CaptchaContent = <ActivityIndicator size="large" color={color.primary} />
  } else {
    CaptchaContent = null
  }

  return (
    <Screen preset="scroll">
      <View style={styles.viewWrapper}>
        <BadgerPhone style={styles.image} />
        <Text style={darkMode ? styles.textDark : styles.textLight}>
          {showCaptcha
            ? LL.PhoneInputScreen.headerVerify()
            : LL.PhoneInputScreen.header()}
        </Text>
        {showCaptcha ? (
          CaptchaContent
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
                placeholder: LL.PhoneInputScreen.placeholder(),
                returnKeyType: loadingRequestPhoneCode ? "default" : "done",
                onSubmitEditing: Keyboard.dismiss,
                keyboardType: "phone-pad",
                textContentType: "telephoneNumber",
                accessibilityLabel: "Input phone number",
              }}
              countryPickerProps={{
                modalProps: {
                  testID: "country-picker",
                },
              }}
              codeTextStyle={styles.codeTextStyle}
              autoFocus={true}
            />
            <ActivityIndicator
              animating={loadingRequestPhoneCode}
              size="large"
              color={color.primary}
              style={styles.activityIndicator}
            />
            <View style={styles.buttons}>
              <Button
                buttonStyle={styles.buttonSms}
                title={LL.PhoneInputScreen.sms()}
                disabled={Boolean(phoneNumber)}
                onPress={submitViaSms}
              />
              <View style={styles.whatsappContainer}>
                <TouchableOpacity onPress={submitViaWhatsapp}>
                  <Text
                    style={darkMode ? styles.textWhatsappDark : styles.textWhatsappLight}
                  >
                    {LL.PhoneInputScreen.whatsapp()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.contactSupportContainer}>
              <ContactSupportButton />
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
      <CloseCross
        color={darkMode ? palette.lightGrey : palette.darkGrey}
        onPress={navigation.goBack}
      />
    </Screen>
  )
}
