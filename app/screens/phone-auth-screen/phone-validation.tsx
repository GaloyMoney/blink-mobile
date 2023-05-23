import { gql } from "@apollo/client"
import analytics from "@react-native-firebase/analytics"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"

import {
  PhoneCodeChannelType,
  useUserLoginMutation,
  useUserLoginUpgradeMutation,
} from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import crashlytics from "@react-native-firebase/crashlytics"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { Screen } from "../../components/screen"
import { useAppConfig } from "../../hooks"
import type { PhoneValidationStackParamList } from "../../navigation/stack-param-lists"
import BiometricWrapper from "../../utils/biometricAuthentication"
import { AuthenticationScreenPurpose } from "../../utils/enum"
import { parseTimer } from "../../utils/timer"
import { CurrencyKeyboard } from "@app/components/currency-keyboard"
import { Key as KeyType } from "@app/components/amount-input-screen/number-pad-reducer"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import { GaloyInfo } from "@app/components/atomic/galoy-info"
import { GaloyWarning } from "@app/components/atomic/galoy-warning"
import { TranslationFunctions } from "@app/i18n/i18n-types"

const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
  flex: { flex: 1 },
  flexAndMinHeight: { flex: 1, minHeight: 16 },
  viewWrapper: { flex: 1 },

  activityIndicator: { marginTop: 12 },
  extraInfoContainer: {
    marginBottom: 20,
    flex: 1,
  },
  codeDigitContainer: {
    borderColor: colors.primary3,
    borderWidth: 2,
    borderRadius: 8,
    width: 40,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sendAgainButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 25,
    textAlign: "center",
  },
  textContainer: {
    marginBottom: 20,
  },
  timerRow: {
    flexDirection: "row",
    justifyContent: "center",
    textAlign: "center",
  },
  marginBottom: {
    marginBottom: 10,
  },
  keyboardContainer: {
    paddingHorizontal: 10,
  },
}))

gql`
  mutation userLogin($input: UserLoginInput!) {
    userLogin(input: $input) {
      errors {
        message
        code
      }
      authToken
    }
  }

  mutation userLoginUpgrade($input: UserLoginUpgradeInput!) {
    userLoginUpgrade(input: $input) {
      errors {
        message
        code
      }
      authToken
    }
  }
`

type PhoneValidationScreenProps = {
  route: RouteProp<PhoneValidationStackParamList, "phoneValidation">
}

const ValidatePhoneCodeStatus = {
  WaitingForCode: "WaitingForCode",
  LoadingAuthResult: "LoadingAuthResult",
  ReadyToRegenerate: "ReadyToRegenerate",
}

type ValidatePhoneCodeStatusType =
  (typeof ValidatePhoneCodeStatus)[keyof typeof ValidatePhoneCodeStatus]

const ValidatePhoneCodeErrors = {
  InvalidCode: "InvalidCode",
  TooManyAttempts: "TooManyAttempts",
  CannotUpgradeToExistingAccount: "CannotUpgradeToExistingAccount",
  UnknownError: "UnknownError",
}

const mapGqlErrorsToValidatePhoneCodeErrors = (
  errors: readonly { code?: string | null | undefined }[],
): ValidatePhoneCodeErrorsType | undefined => {
  if (errors.some((error) => error.code === "PHONE_CODE_ERROR")) {
    return ValidatePhoneCodeErrors.InvalidCode
  }

  if (errors.some((error) => error.code === "TOO_MANY_REQUEST")) {
    return ValidatePhoneCodeErrors.TooManyAttempts
  }

  if (errors.some((error) => error.code === "PHONE_ACCOUNT_ALREADY_EXISTS_ERROR" || error.code === "PHONE_ACCOUNT_ALREADY_EXISTS_NEED_TO_SWEEP_FUNDS_ERROR")) {
    return ValidatePhoneCodeErrors.CannotUpgradeToExistingAccount
  }

  if (errors.length > 0) {
    return ValidatePhoneCodeErrors.UnknownError
  }

  return undefined
}

const mapValidatePhoneCodeErrorsToMessage = (
  error: ValidatePhoneCodeErrorsType,
  LL: TranslationFunctions,
): string => {
  switch (error) {
    case ValidatePhoneCodeErrors.InvalidCode:
      return LL.PhoneValidationScreen.errorLoggingIn()
    case ValidatePhoneCodeErrors.TooManyAttempts:
      return LL.PhoneValidationScreen.errorTooManyAttempts()
    case ValidatePhoneCodeErrors.CannotUpgradeToExistingAccount:
      return LL.PhoneValidationScreen.errorCannotUpgradeToExistingAccount()
    case ValidatePhoneCodeErrors.UnknownError:
    default:
      return LL.errors.generic()
  }
}

type ValidatePhoneCodeErrorsType =
  (typeof ValidatePhoneCodeErrors)[keyof typeof ValidatePhoneCodeErrors]

export const PhoneValidationScreen: React.FC<PhoneValidationScreenProps> = ({
  route,
}) => {
  const styles = useStyles()
  const navigation =
    useNavigation<StackNavigationProp<PhoneValidationStackParamList, "phoneValidation">>()

  const [status, setStatus] = useState<ValidatePhoneCodeStatusType>(
    ValidatePhoneCodeStatus.WaitingForCode,
  )
  const [error, setError] = useState<ValidatePhoneCodeErrorsType | undefined>()

  const { saveToken } = useAppConfig()

  const { LL } = useI18nContext()

  const { appConfig } = useAppConfig()

  const [userLoginMutation] = useUserLoginMutation({
    fetchPolicy: "no-cache",
  })

  const [userLoginUpgradeMutation] = useUserLoginUpgradeMutation({
    fetchPolicy: "no-cache",
  })

  const isUpgradeFlow = appConfig.isAuthenticatedWithDeviceAccount

  const [code, setCode] = useState("")
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30)
  const { phone, channel } = route.params
  const {
    theme: { colors },
  } = useTheme()

  const send = useCallback(
    async (code: string) => {
      if (status === ValidatePhoneCodeStatus.LoadingAuthResult) {
        return
      }

      try {
        let sessionToken: string | null | undefined
        let errors: readonly { code?: string | null | undefined }[] | undefined

        setStatus(ValidatePhoneCodeStatus.LoadingAuthResult)
        if (isUpgradeFlow) {
          const { data } = await userLoginUpgradeMutation({
            variables: { input: { phone, code } },
          })

          sessionToken = data?.userLoginUpgrade?.authToken
          errors = data?.userLoginUpgrade?.errors
        } else {
          const { data } = await userLoginMutation({
            variables: { input: { phone, code } },
          })

          sessionToken = data?.userLogin?.authToken
          errors = data?.userLogin?.errors
        }

        if (sessionToken) {
          analytics().logLogin({ method: isUpgradeFlow ? "upgrade" : "phone" })

          saveToken(sessionToken)

          if (await BiometricWrapper.isSensorAvailable()) {
            navigation.replace("authentication", {
              screenPurpose: AuthenticationScreenPurpose.TurnOnAuthentication,
            })
          } else {
            navigation.replace("Primary")
          }
        } else {
          setError(
            mapGqlErrorsToValidatePhoneCodeErrors(errors || []) ||
              ValidatePhoneCodeErrors.UnknownError,
          )
          setCode("")
          setStatus(ValidatePhoneCodeStatus.ReadyToRegenerate)
        }
      } catch (err) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          console.debug({ err })
        }
        setError(ValidatePhoneCodeErrors.UnknownError)
        setCode("")
        setStatus(ValidatePhoneCodeStatus.ReadyToRegenerate)
      }
    },
    [
      status,
      userLoginMutation,
      userLoginUpgradeMutation,
      phone,
      saveToken,
      setCode,
      navigation,
      isUpgradeFlow,
    ],
  )

  const receivePhoneKey = (key: KeyType) => {
    if (key === KeyType.Decimal) {
      return
    }

    if (key === KeyType.Backspace) {
      setCode(code.slice(0, -1))
      return
    }

    if (code.length === 6) {
      return
    }

    const newCode = code + key
    setError(undefined)
    setCode(newCode)
    if (newCode.length === 6) {
      send(newCode)
    }
  }

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (secondsRemaining > 0) {
        setSecondsRemaining(secondsRemaining - 1)
      } else if (status === ValidatePhoneCodeStatus.WaitingForCode) {
        setStatus(ValidatePhoneCodeStatus.ReadyToRegenerate)
      }
    }, 1000)
    return () => clearTimeout(timerId)
  }, [secondsRemaining, status])

  const codeIndexes = [0, 1, 2, 3, 4, 5] as const

  const errorMessage = error && mapValidatePhoneCodeErrorsToMessage(error, LL)
  let extraInfoContent = undefined
  switch (status) {
    case ValidatePhoneCodeStatus.ReadyToRegenerate:
      extraInfoContent = (
        <>
          {errorMessage && (
            <View style={styles.marginBottom}>
              <GaloyWarning errorMessage={errorMessage} highlight={true} />
            </View>
          )}
          <View style={styles.marginBottom}>
            <GaloyInfo highlight={true}>
              {LL.PhoneValidationScreen.sendViaOtherChannel({
                channel,
                other: channel === "SMS" ? "WhatsApp" : PhoneCodeChannelType.Sms,
              })}
            </GaloyInfo>
          </View>
          <GaloySecondaryButton
            title={LL.PhoneValidationScreen.sendAgain()}
            onPress={() => navigation.goBack()}
          />
        </>
      )
      break
    case ValidatePhoneCodeStatus.LoadingAuthResult:
      extraInfoContent = (
        <ActivityIndicator
          style={styles.activityIndicator}
          size="large"
          color={colors.primary}
        />
      )
      break
    case ValidatePhoneCodeStatus.WaitingForCode:
      extraInfoContent = (
        <View style={styles.timerRow}>
          <Text type="p3" color={colors.grey5}>
            {LL.PhoneValidationScreen.sendAgain()} {parseTimer(secondsRemaining)}
          </Text>
        </View>
      )
      break
  }

  return (
    <Screen preset="scroll" style={styles.screenStyle}>
      <View style={styles.viewWrapper}>
        <View style={styles.textContainer}>
          <Text type="h2">
            {LL.PhoneValidationScreen.header({ channel, phoneNumber: phone })}
          </Text>
        </View>
        <View style={styles.codeContainer}>
          {codeIndexes.map((index) => (
            <View style={styles.codeDigitContainer} key={index}>
              <Text type="h2">{code[index]}</Text>
            </View>
          ))}
        </View>
        <View style={styles.extraInfoContainer}>{extraInfoContent}</View>
        <View style={styles.keyboardContainer}>
          <CurrencyKeyboard onPress={receivePhoneKey} />
        </View>
      </View>
    </Screen>
  )
}
