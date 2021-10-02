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
  View,
} from "react-native"
import { Button, Input } from "react-native-elements"
import { FetchResult, gql, useApolloClient, useMutation } from "@apollo/client"
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
import { parseTimer } from "../../utils/timer"

const REQUEST_AUTH_CODE = gql`
  mutation userRequestAuthCode($input: UserRequestAuthCodeInput!) {
    userRequestAuthCode(input: $input) {
      errors {
        message
      }
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

export const WelcomePhoneInputScreen: ScreenType = ({
  navigation,
}: WelcomePhoneInputScreenProps) => {
  const [requestPhoneCode, { loading }] = useMutation(REQUEST_AUTH_CODE, {
    fetchPolicy: "no-cache",
  })

  const inputRef = useRef<PhoneInput | null>()

  const send = useCallback(async () => {
    const phone = inputRef.current.getValue()
    const phoneRegex = new RegExp("^\\+[0-9]+$")

    if (!inputRef.current.isValidNumber() || !phoneRegex.test(phone)) {
      Alert.alert(`${phone} ${translate("errors.invalidPhoneNumber")}`)
      return
    }

    try {
      const { data } = await requestPhoneCode({ variables: { input: { phone } } })

      if (data.userRequestAuthCode.success) {
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

  useEffect(() => {
    inputRef?.current.focus()
  }, [])

  return (
    <Screen backgroundColor={palette.lighterGrey} preset="scroll">
      <View style={{ flex: 1, justifyContent: "space-around" }}>
        <View>
          <BadgerPhone style={styles.image} />
          <Text style={styles.text}>{translate("WelcomePhoneInputScreen.header")}</Text>
        </View>
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
