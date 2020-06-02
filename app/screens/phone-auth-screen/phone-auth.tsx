import { isEmpty } from "ramda"
import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native"
import { Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import PhoneInput from "react-native-phone-input"
import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import BadgerPhone from "./badger-phone-01.svg"
import { GRAPHQL_SERVER_URI } from "../../app"
import request from "graphql-request"
import { Token } from "../../utils/token"

const styles = EStyleSheet.create({
  activityIndicatorWrapper: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    display: "flex",
    height: 100,
    justifyContent: "space-around",
    width: 100,
  },

  buttonContainer: {
    paddingHorizontal: 80,
    paddingVertical: 10,
  },

  buttonStyle: {
    backgroundColor: color.primary,
  },

  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
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
    marginHorizontal: "50rem",
    marginVertical: "18rem",
    paddingHorizontal: "18rem",
    paddingVertical: "12rem",
    // height: "52rem",
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

  codeContainer: {
    alignSelf: "center",
    width: "70%"
  }
})

export const WelcomePhoneInputScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const inputRef = useRef()

  const send = async () => {
    console.tron.log(`initPhoneNumber ${inputRef.current.getValue()}`)

    if (!inputRef.current.isValidNumber()) {
      Alert.alert(`${inputRef.current.getValue()} ${translate("errors.invalidPhoneNumber")}`)
      return
    }

    try {
      setLoading(true)
      
      const query = `mutation requestPhoneCode($phone: String) {
        requestPhoneCode(phone: $phone) {
          success
        }
      }`

      const phone = inputRef.current.getValue()
      const success = await request(GRAPHQL_SERVER_URI, query, {phone})

      if (success) {
        setLoading(false)
        const screen = "welcomePhoneValidation"
        navigation.navigate(screen, {phone})       

      } else {
        setErr("Error with the request. Try again later")
      }

    } catch (err) {
      console.tron.warn(err)
      setErr(err.toString())
    }
  }

  // workaround of https://github.com/facebook/react-native/issues/10471
  useEffect(() => {
    if (err !== "") {
      setErr("")
      Alert.alert("error", err.toString(), [
        {
          text: "OK",
          onPress: () => {
            setLoading(false)
          },
        },
      ])
    }
  }, [err])

  return (
    <Screen backgroundColor={palette.lighterGrey}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <View style={{ flex: 1 }} />
        <BadgerPhone style={styles.image} />
        <Text style={styles.text}>{translate("WelcomePhoneInputScreen.header")}</Text>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <PhoneInput
            ref={inputRef}
            style={styles.phoneEntryContainer}
            textStyle={styles.textEntry}
            textProps={{
              autoFocus: true,
              placeholder: translate("WelcomePhoneInputScreen.placeholder"),
              returnKeyType: loading ? "default" : "done",
              onSubmitEditing: () => send(),
            }}
          />
        </KeyboardAvoidingView>
        <View style={{ flex: 1 }} />
        <ActivityIndicator animating={loading} size="large" color={color.primary} />
        <View style={{ flex: 1 }} />
      </View>
      <CloseCross color={palette.darkGrey} onPress={() => navigation.goBack()} />
    </Screen>
)}

export const WelcomePhoneValidationScreenDataInjected = ({ route, navigation }) => {
  const store = React.useContext(StoreContext)

  const onSuccess = () => {
    const level = 1
    store.user.updateLevel(level)
    console.tron.log("onLoggedinSuccess complete")
  }

  return <WelcomePhoneValidationScreen onSuccess={onSuccess} route={route} navigation={navigation} />
}


export const WelcomePhoneValidationScreen = ({ onSuccess, route, navigation }) => {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const phone = route.params.phone

  const sendVerif = async () => {
    console.tron.log(`verifyPhoneNumber with code ${code}`)
    if (code.length !== 6) {
      Alert.alert(`code need to have 6 digits`)
      return
    }

    try {
      setLoading(true)
      
      const query = `mutation login($phone: String, $code: Int) {
        login(phone: $phone, code: $code) {
          token
        }
      }`

      const variables = {phone, code: Number(code)}
      console.tron.log({variables})
      const { login } = await request(GRAPHQL_SERVER_URI, query, variables)
      console.tron.log({login})

      if (login.token) {
        const token = new Token()
        await token.save({token: login.token})
        // await onSuccess() FIXME
        navigation.navigate("Accounts")
      } else {
        setErr("Error logging in. Did you use the right code?")
      }

    } catch (err) {
      console.tron.warn(err)
      setErr(err.toString())
      setLoading(false)
    }
  }

  return (
    <Screen backgroundColor={palette.lighterGrey}>
      <View style={{flex: 1}}>
        <ScrollView>
          <View style={{ flex: 1, minHeight: 32 }} />
          <BadgerPhone style={styles.image} />
          <Text style={styles.text}>{translate("WelcomePhoneValidationScreen.header")}</Text>
          <KeyboardAvoidingView
            keyboardVerticalOffset={-110}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <Input
              errorStyle={{ color: palette.red }}
              errorMessage={err}
              autoFocus={true}
              style={styles.phoneEntryContainer}
              containerStyle={styles.codeContainer}
              onChangeText={(input) => setCode(input)}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              placeholder={translate("WelcomePhoneValidationScreen.placeholder")}
              returnKeyType={loading ? "default" : "done"}
              maxLength={6}
              onSubmitEditing={() => sendVerif()}
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
