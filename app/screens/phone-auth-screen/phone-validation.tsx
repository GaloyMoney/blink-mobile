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
import { Text, makeStyles, useTheme, Input } from "@rneui/themed"
import { Screen } from "../../components/screen"
import { useAppConfig } from "../../hooks"
import type { PhoneValidationStackParamList } from "../../navigation/stack-param-lists"
import BiometricWrapper from "../../utils/biometricAuthentication"
import { AuthenticationScreenPurpose } from "../../utils/enum"
import { parseTimer } from "../../utils/timer"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import { GaloyInfo } from "@app/components/atomic/galoy-info"
import { GaloyErrorBox } from "@app/components/atomic/galoy-error-box"
import { TranslationFunctions } from "@app/i18n/i18n-types"
import { logUpgradeLoginAttempt, logValidateAuthCodeFailure } from "@app/utils/analytics"

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
} as const

const mapGqlErrorsToValidatePhoneCodeErrors = (
  errors: readonly { code?: string | null | undefined }[],
): ValidatePhoneCodeErrorsType | undefined => {
  if (errors.some((error) => error.code === "PHONE_CODE_ERROR")) {
    return ValidatePhoneCodeErrors.InvalidCode
  }

  if (errors.some((error) => error.code === "TOO_MANY_REQUEST")) {
    return ValidatePhoneCodeErrors.TooManyAttempts
  }

  if (
    errors.some(
      (error) =>
        error.code === "PHONE_ACCOUNT_ALREADY_EXISTS_ERROR" ||
        error.code === "PHONE_ACCOUNT_ALREADY_EXISTS_NEED_TO_SWEEP_FUNDS_ERROR",
    )
  ) {
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

export type ValidatePhoneCodeErrorsType =
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

  const [code, _setCode] = useState("")
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
          logUpgradeLoginAttempt()
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
          analytics().logLogin({ method: "phone" })

          saveToken(sessionToken)

          if (await BiometricWrapper.isSensorAvailable()) {
            navigation.replace("authentication", {
              screenPurpose: AuthenticationScreenPurpose.TurnOnAuthentication,
            })
          } else {
            navigation.replace("Primary")
          }
        } else {
          const error =
            mapGqlErrorsToValidatePhoneCodeErrors(errors || []) ||
            ValidatePhoneCodeErrors.UnknownError

          logValidateAuthCodeFailure({
            error,
          })
          setError(error)
          _setCode("")
          setStatus(ValidatePhoneCodeStatus.ReadyToRegenerate)
        }
      } catch (err) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          console.debug({ err })
        }
        setError(ValidatePhoneCodeErrors.UnknownError)
        _setCode("")
        setStatus(ValidatePhoneCodeStatus.ReadyToRegenerate)
      }
    },
    [
      status,
      userLoginMutation,
      userLoginUpgradeMutation,
      phone,
      saveToken,
      _setCode,
      navigation,
      isUpgradeFlow,
    ],
  )

  const setCode = (code: string) => {
    if (code.length > 6) {
      return
    }

    setError(undefined)
    _setCode(code)
    if (code.length === 6) {
      send(code)
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

  const errorMessage = error && mapValidatePhoneCodeErrorsToMessage(error, LL)
  let extraInfoContent = undefined
  switch (status) {
    case ValidatePhoneCodeStatus.ReadyToRegenerate:
      extraInfoContent = (
        <>
          {errorMessage && (
            <View style={styles.marginBottom}>
              <GaloyErrorBox errorMessage={errorMessage} />
            </View>
          )}
          <View style={styles.marginBottom}>
            <GaloyInfo>
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
          <Text type="p3" color={colors.grey3}>
            {LL.PhoneValidationScreen.sendAgain()} {parseTimer(secondsRemaining)}
          </Text>
        </View>
      )
      break
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
          <Text type="h2">
            {LL.PhoneValidationScreen.header({ channel, phoneNumber: phone })}
          </Text>
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

        <View style={styles.extraInfoContainer}>{extraInfoContent}</View>
      </View>
    </Screen>
  )
}
