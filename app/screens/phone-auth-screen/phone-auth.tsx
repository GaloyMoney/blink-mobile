/* eslint-disable react-native/no-inline-styles */
import * as React from "react"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native"
import { Input } from "react-native-elements"
import { gql, useApolloClient, useLazyQuery, useMutation } from "@apollo/client"
import EStyleSheet from "react-native-extended-stylesheet"
import PhoneInput from "react-native-phone-input"
import analytics from "@react-native-firebase/analytics"

// Components
import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"

// Functions
import { translate } from "../../i18n"
import { MAIN_QUERY } from "../../graphql/query"

// Theme
import { color } from "../../theme"
import { palette } from "../../theme/palette"

// Utils
import { Token } from "../../utils/token"
import { toastShow } from "../../utils/toast"
import { addDeviceToken } from "../../utils/notifications"

// Types
import type { ScreenType } from "../../types/screen"

// Assets
import BadgerPhone from "./badger-phone-01.svg"

const REQUEST_PHONE_CODE = gql`
  mutation requestPhoneCode($phone: String) {
    requestPhoneCode(phone: $phone) {
      success
    }
  }
`

const LOGIN = gql`
  mutation login($phone: String, $code: Int) {
    login(phone: $phone, code: $code) {
      token
    }
  }
`

const styles = EStyleSheet.create({
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

  text: {
    fontSize: "20rem",
    paddingBottom: "10rem",
    paddingHorizontal: "40rem",
    textAlign: "center",
  },

  textEntry: {
    color: color.palette.darkGrey,
    fontSize: "18rem",
  },
})

type WelcomePhoneInputScreenProps = {
  navigation: any
}

export const WelcomePhoneInputScreen: ScreenType = ({
  navigation,
}: WelcomePhoneInputScreenProps) => {
  const [requestPhoneCode, { loading }] = useMutation(REQUEST_PHONE_CODE, {
    fetchPolicy: "no-cache",
  })

  const inputRef = useRef<PhoneInput | null>()

  const send = async () => {
    const phone = inputRef.current.getValue()
    console.log({ initPhoneNumber: phone })
    const phoneRegex = new RegExp("^\\+[0-9]+$")

    if (!inputRef.current.isValidNumber() || !phoneRegex.test(phone)) {
      Alert.alert(`${phone} ${translate("errors.invalidPhoneNumber")}`)
      return
    }

    try {
      const { data } = await requestPhoneCode({ variables: { phone } })
      if (data.requestPhoneCode.success) {
        const screen = "welcomePhoneValidation"
        navigation.navigate(screen, { phone })
      } else {
        toastShow(translate("erros.generic"))
      }
    } catch (err) {
      console.warn({ err })
      // use global Toaster?
      // setErr(err.toString())
    }
  }

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
  route: string
  navigation: any
}

export const WelcomePhoneValidationScreenDataInjected: ScreenType = ({
  route,
  navigation,
}: WelcomePhoneValidationScreenDataInjectedProps) => {
  const client = useApolloClient()

  const [login, { loading, error }] = useMutation(LOGIN, {
    fetchPolicy: "no-cache",
  })

  const [reloadMainQuery] = useLazyQuery(MAIN_QUERY, {
    fetchPolicy: "network-only",
  })

  const onSuccess = async ({ token }) => {
    analytics().logLogin({ method: "phone" })
    await new Token().save({ token })

    // TODO refactor from mst-gql to apollo client
    // sync the earned quizzes
    // const ids = map(filter(values(self.earns), {completed: true}), "id")
    // yield self.mutateEarnCompleted({ids})

    // console.log("succesfully update earns id")

    // self.transactions.clear()
    // self.wallets.get("BTC").transactions.clear()

    // console.log("cleared local transactions")

    reloadMainQuery({ variables: { logged: new Token().has() } })

    console.log("sending device token for notifications")
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
  login: (params) => any
  onSuccess: (params) => void
  navigation: any
  route: Record<string, any>
  loading: boolean
  error: string
}

export const WelcomePhoneValidationScreen: ScreenType = ({
  onSuccess,
  route,
  navigation,
  login,
  loading,
  error,
}: WelcomePhoneValidationScreenProps) => {
  // FIXME see what to do with store and storybook
  const [code, setCode] = useState("")

  const { phone } = route.params
  const updateCode = (input) => setCode(input)

  const send = async () => {
    if (code.length !== 6) {
      toastShow(translate("WelcomePhoneValidationScreen.need6Digits"))
      return
    }

    try {
      const { data } = await login({
        variables: { phone, code: Number(code) },
      })

      // TODO: validate token
      const token = data?.login?.token

      if (token) {
        await onSuccess({ token })
        navigation.navigate("MoveMoney")
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
  }, [code])

  return (
    <Screen backgroundColor={palette.lighterGrey}>
      <View style={{ flex: 1 }}>
        <ScrollView>
          <View style={{ flex: 1, minHeight: 32 }} />
          <BadgerPhone style={styles.image} />
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
          </KeyboardAvoidingView>
          <View style={{ flex: 1, minHeight: 16 }} />
          <ActivityIndicator animating={loading} size="large" color={color.primary} />
          <View style={{ flex: 1 }} />
        </ScrollView>
      </View>
    </Screen>
  )
}
