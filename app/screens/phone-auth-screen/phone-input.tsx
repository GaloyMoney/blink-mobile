import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useEffect } from "react"
import { ActivityIndicator, View } from "react-native"
import CountryPicker, { CountryCode } from "react-native-country-picker-modal"
import { getCountries, CountryCode as PhoneNumberCountryCode } from "libphonenumber-js"
import { ContactSupportButton } from "@app/components/contact-support-button/contact-support-button"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles, useTheme, Text } from "@rneui/themed"
import { Screen } from "../../components/screen"
import { useAppConfig } from "../../hooks"
import type { PhoneValidationStackParamList } from "../../navigation/stack-param-lists"
import {
  ErrorType,
  MessagingChannel,
  RequestPhoneCodeStatus,
  useRequestPhoneCode,
} from "./useRequestPhoneCode"
import { CurrencyKeyboard } from "@app/components/currency-keyboard"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import { GaloyWarning } from "@app/components/atomic/galoy-warning"

const DEFAULT_COUNTRY_CODE = "SV"
const DEFAULT_PHONE_NUMBER = "123-456-7890"

const useStyles = makeStyles((theme) => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 25,
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
    backgroundColor: theme.colors.primary10,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  errorContainer: {
    marginBottom: 20,
  },
  numberContainer: {
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
    paddingVertical: 10,
    marginLeft: 20,
    flex: 1,
    borderColor: theme.colors.primary5,
    borderWidth: 2,
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
  const { theme } = useTheme()

  const {
    submitPhoneNumber,
    captchaLoading,
    status,
    receivePhoneKey,
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
          <ActivityIndicator size="large" color={theme.colors.primary} />
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
    }
  }

  return (
    <Screen preset="scroll" style={styles.screenStyle}>
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
            countryCodes={getCountries() as CountryCode[]}
            onSelect={(country) => setCountryCode(country.cca2 as PhoneNumberCountryCode)}
            containerButtonStyle={styles.countryPickerButtonStyle}
            withCallingCodeButton={true}
            withFilter={true}
            withCallingCode={true}
          />
          <View style={styles.numberContainer}>
            <Text
              type="h2"
              color={
                phoneInputInfo?.formattedPhoneNumber ? undefined : theme.colors.grey8
              }
            >
              {phoneInputInfo?.formattedPhoneNumber || DEFAULT_PHONE_NUMBER}
            </Text>
          </View>
        </View>
        {errorMessage && (
          <View style={styles.errorContainer}>
            <GaloyWarning errorMessage={errorMessage} highlight={true} />
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
        <View style={styles.keyboardContainer}>
          <CurrencyKeyboard onPress={receivePhoneKey} />
        </View>
      </View>
    </Screen>
  )
}
