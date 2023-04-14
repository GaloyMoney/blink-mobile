import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
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
} from "react-native"
import PhoneInput from "react-native-phone-number-input"

import { gql } from "@apollo/client"
import DownArrow from "@app/assets/icons/downarrow.svg"
import { GaloyTertiaryButton } from "@app/components/atomic/galoy-tertiary-button"
import { ContactSupportButton } from "@app/components/contact-support-button/contact-support-button"
import {
  PhoneCodeChannelType,
  useCaptchaRequestAuthCodeMutation,
} from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { logRequestAuthCode } from "@app/utils/analytics"
import crashlytics from "@react-native-firebase/crashlytics"
import { Button, makeStyles } from "@rneui/themed"
import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"
import { useAppConfig, useGeetestCaptcha } from "../../hooks"
import type { PhoneValidationStackParamList } from "../../navigation/stack-param-lists"
import { color, palette } from "../../theme"
import { toastShow } from "../../utils/toast"
import BadgerPhone from "./badger-phone-01.svg"
import Icon from "react-native-vector-icons/Ionicons"

const phoneRegex = new RegExp("^\\+[0-9]+$")

const useStyles = makeStyles((theme) => ({
  buttonsContainer: {
    flex: 1,
    paddingHorizontal: 30,
  },

  button: {
    marginBottom: 12,
  },

  image: {
    alignSelf: "center",
    marginBottom: 30,
    resizeMode: "center",
  },

  phoneEntryContainer: {
    borderColor: theme.colors.grey7,
    borderRadius: 5,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 40,
    marginVertical: 18,
  },

  text: {
    color: theme.colors.darkGreyOrWhite,
    fontSize: 20,
    paddingBottom: 10,
    paddingHorizontal: 30,
    textAlign: "center",
  },

  textWhatsapp: {
    color: theme.colors.darkGreyOrWhite,
    fontSize: 18,
    textAlign: "center",
  },

  textContainer: {
    backgroundColor: palette.white,
  },

  textEntry: {
    color: color.palette.darkGrey,
    fontSize: 16,
  },

  viewWrapper: { flex: 1, justifyContent: "space-around", marginTop: 50 },

  activityIndicator: { marginTop: 12 },

  codeTextStyle: { marginLeft: -25 },

  contactSupportContainer: {
    marginTop: 50,
    marginBottom: 20,
    alignItems: "center",
  },

  closecross: {
    color: theme.colors.black,
  },

  loadingView: { flex: 1, justifyContent: "center", alignItems: "center" },

  buttonTitle: {
    fontWeight: "600",
  },
}))

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
  const [defaultCode, setDefaultCode] = useState<CountryCode | undefined>()

  const styles = useStyles()

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
    const getCountryCodeFromIP = async () => {
      try {
        const response = (await fetchWithTimeout("https://ipapi.co/json/")) as Response
        const data = await response.json()

        if (data && data.country_code) {
          const countryCode = data.country_code
          setDefaultCode(countryCode)
        } else {
          console.warn("no data or country_code in response")
          setDefaultCode("SV")
        }
      } catch (error) {
        console.error(error)
        setDefaultCode("SV")
      }
    }

    getCountryCodeFromIP()
  }, [])

  useEffect(() => {
    if (phoneNumber) {
      if (appConfig.galoyInstance.name === "Local") {
        navigation.navigate("phoneValidation", {
          phone: phoneNumber,
          channel,
        })
        return
      }
      registerCaptcha()
    }
  }, [registerCaptcha, phoneNumber, navigation, channel, appConfig.galoyInstance.name])

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
            navigation.replace("phoneValidation", {
              phone: phoneNumber,
              channel,
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

  if (!defaultCode) {
    // TODO: refactor this with a loading screen
    return (
      <Screen>
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color={palette.blue} />
        </View>
      </Screen>
    )
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
        <Text style={styles.text}>
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
              defaultCode={defaultCode}
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
            <View style={styles.buttonsContainer}>
              <Button
                containerStyle={styles.button}
                titleStyle={styles.buttonTitle}
                title={LL.PhoneInputScreen.sms()}
                disabled={Boolean(phoneNumber)}
                onPress={submitViaSms}
              />
              <GaloyTertiaryButton
                containerStyle={styles.button}
                title={LL.PhoneInputScreen.whatsapp() + "  "}
                onPress={submitViaWhatsapp}
                icon={<Icon name="logo-whatsapp" size={24} color={color.primary} />}
              />
              <ContactSupportButton containerStyle={styles.button} />
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
      <CloseCross color={styles.closecross.color} onPress={navigation.goBack} />
    </Screen>
  )
}

const fetchWithTimeout = (url: string, timeout = 5000) => {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("request timed out")), timeout)
    }),
  ])
}
