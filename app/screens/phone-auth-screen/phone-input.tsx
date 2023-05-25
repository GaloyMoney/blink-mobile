import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useEffect } from "react"
import { ActivityIndicator, View } from "react-native"
import CountryPicker, { CountryCode } from "react-native-country-picker-modal"
import { CountryCode as PhoneNumberCountryCode } from "libphonenumber-js/mobile"
import { ContactSupportButton } from "@app/components/contact-support-button/contact-support-button"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles, useTheme, Text, Input } from "@rneui/themed"
import { Screen } from "../../components/screen"
import { useAppConfig } from "../../hooks"
import type { PhoneValidationStackParamList } from "../../navigation/stack-param-lists"
import {
  ENABLED_COUNTRIES,
  ErrorType,
  MessagingChannel,
  RequestPhoneCodeStatus,
  useRequestPhoneCode,
} from "./useRequestPhoneCode"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import { GaloyErrorBox } from "@app/components/atomic/galoy-error-box"

const DEFAULT_COUNTRY_CODE = "SV"
const DEFAULT_PHONE_NUMBER = "123-456-7890"

const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },

  phoneEntryContainer: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 48,
  },
  textContainer: {
    marginBottom: 20,
  },
  viewWrapper: { flex: 1 },

  activityIndicator: { marginTop: 12 },

  keyboardContainer: {
    paddingHorizontal: 10,
  },

  codeTextStyle: {},
  countryPickerButtonStyle: {
    minWidth: 100,
    backgroundColor: colors.primary5,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  inputComponentContainerStyle: {
    flex: 1,
    marginLeft: 20,
    paddingLeft: 0,
    paddingRight: 0,
  },
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
  whatsAppButton: {
    marginBottom: 20,
  },
  contactSupportButton: {
    marginTop: 10,
  },

  loadingView: { flex: 1, justifyContent: "center", alignItems: "center" },
}))

export const PhoneInputScreen: React.FC = () => {
  const styles = useStyles()

  const navigation =
    useNavigation<StackNavigationProp<PhoneValidationStackParamList, "phoneInput">>()
  const { appConfig } = useAppConfig()
  const {
    theme: { colors },
  } = useTheme()

  const {
    submitPhoneNumber,
    captchaLoading,
    status,
    setPhoneNumber,
    phoneInputInfo,
    messagingChannel,
    error,
    validatedPhoneNumber,
    setStatus,
    setCountryCode,
  } = useRequestPhoneCode({
    skipRequestPhoneCode: appConfig.galoyInstance.name === "Local",
  })

  const { LL } = useI18nContext()

  useEffect(() => {
    if (status === RequestPhoneCodeStatus.SuccessRequestingCode) {
      setStatus(RequestPhoneCodeStatus.InputtingPhoneNumber)
      navigation.navigate("phoneValidation", {
        phone: validatedPhoneNumber || "",
        channel: messagingChannel,
      })
    }
  }, [status, messagingChannel, validatedPhoneNumber, navigation, setStatus])

  if (status === RequestPhoneCodeStatus.LoadingCountryCode) {
    return (
      <Screen>
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    )
  }

  const showCaptcha = false

  let errorMessage
  if (error) {
    switch (error) {
      case ErrorType.FailedCaptchaError:
        errorMessage = LL.PhoneInputScreen.errorRequestingCaptcha()
        break
      case ErrorType.RequestCodeError:
        errorMessage = LL.PhoneInputScreen.errorRequestingCode()
        break
      case ErrorType.TooManyAttemptsError:
        errorMessage = LL.errors.tooManyRequestsPhoneCode()
        break
      case ErrorType.InvalidPhoneNumberError:
        errorMessage = LL.PhoneInputScreen.errorInvalidPhoneNumber()
        break
      case ErrorType.UnsupportedCountryError:
        errorMessage = LL.PhoneInputScreen.errorUnsupportedCountry()
        break
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
          <Text type={"p1"}>
            {showCaptcha
              ? LL.PhoneInputScreen.headerVerify()
              : LL.PhoneInputScreen.header()}
          </Text>
        </View>

        <View style={styles.phoneEntryContainer}>
          <CountryPicker
            countryCode={
              (phoneInputInfo?.countryCode || DEFAULT_COUNTRY_CODE) as CountryCode
            }
            countryCodes={ENABLED_COUNTRIES as CountryCode[]}
            onSelect={(country) => setCountryCode(country.cca2 as PhoneNumberCountryCode)}
            containerButtonStyle={styles.countryPickerButtonStyle}
            withCallingCodeButton={true}
            withFilter={true}
            filterProps={{
              autoFocus: true,
            }}
            withCallingCode={true}
          />
          <Input
            placeholder={DEFAULT_PHONE_NUMBER}
            containerStyle={styles.inputComponentContainerStyle}
            inputContainerStyle={styles.inputContainerStyle}
            renderErrorMessage={false}
            textContentType="telephoneNumber"
            keyboardType="phone-pad"
            value={phoneInputInfo?.rawPhoneNumber}
            onChangeText={setPhoneNumber}
            autoFocus={true}
          />
        </View>
        {errorMessage && (
          <View style={styles.errorContainer}>
            <GaloyErrorBox errorMessage={errorMessage} />
            <ContactSupportButton containerStyle={styles.contactSupportButton} />
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <GaloySecondaryButton
            title={LL.PhoneInputScreen.whatsapp()}
            containerStyle={styles.whatsAppButton}
            loading={captchaLoading && messagingChannel === MessagingChannel.Whatsapp}
            onPress={() => submitPhoneNumber(MessagingChannel.Whatsapp)}
          />
          <GaloyPrimaryButton
            title={LL.PhoneInputScreen.sms()}
            loading={captchaLoading && messagingChannel === MessagingChannel.Sms}
            onPress={() => submitPhoneNumber(MessagingChannel.Sms)}
          />
        </View>
      </View>
    </Screen>
  )
}
