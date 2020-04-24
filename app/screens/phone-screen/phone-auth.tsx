import auth from "@react-native-firebase/auth"
import { inject } from "mobx-react"
import { isEmpty } from "ramda"
import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { ScrollView, TextInput } from "react-native-gesture-handler"
import PhoneInput from "react-native-phone-input"
import { Onboarding } from "types"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import BadgerPhone from "./badger-phone-01.svg"
import { CloseCross } from "../../components/close-cross"

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
    marginHorizontal: 60,
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  text: {
    fontSize: "20rem",
    paddingBottom: "10rem",
    paddingHorizontal: "40rem",
    textAlign: "center",
  },

  textEntry: {
    color: color.palette.darkGrey,
    fontSize: "20rem",
  },
})

export const WelcomePhoneInputScreen = ({ navigation, route }) => {
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
      const confirmation = await auth().signInWithPhoneNumber(inputRef.current.getValue())
      if (!isEmpty(confirmation)) {
        setLoading(false)
        const screen = "welcomePhoneValidation"
        navigation.navigate(screen, { confirmation })
      } else {
        setErr(`confirmation object is empty? ${confirmation}`)
      }
    } catch (err) {
      console.tron.error(err)
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
      <CloseCross color={palette.darkGrey} navigation={navigation} />
    </Screen>
)}

export const WelcomePhoneValidationScreen = inject("dataStore")(({ dataStore, route, navigation }) => {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const confirmation = route.params.confirmation

  const onAuthStateChanged = async (user) => {
    // TODO : User type
    console.tron.log(`onAuthStateChanged`, user)
    console.log(`onAuthStateChanged`, user)

    if (user.phoneNumber) {
      await dataStore.onboarding.add(Onboarding.phoneVerification)
      navigation.navigate("Accounts", {forceRefresh: true})
      // FIXME forceRefresh doesn't seem to be passed by
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber // unsubscribe on unmount
  }, [])

  const sendVerif = async () => {
    console.tron.log(`verifyPhoneNumber with code ${code}`)
    if (code.length !== 6) {
      Alert.alert(`code need to have 6 digits`)
      return
    }
    try {
      setLoading(true)
      await confirmation.confirm(code)
    } catch (err) {
      console.tron.error(err) // Invalid code
      setErr(err.toString())
    }
  }

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
      <View style={{flex: 1}}>
        <View style={{ flex: 1 }} />
        <BadgerPhone style={styles.image} />
        <Text style={styles.text}>{translate("WelcomePhoneValidationScreen.header")}</Text>
        <KeyboardAvoidingView
          keyboardVerticalOffset={-110}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TextInput
            autoFocus={true}
            style={[styles.textEntry, styles.phoneEntryContainer]}
            onChangeText={(input) => setCode(input)}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            placeholder={translate("WelcomePhoneValidationScreen.placeholder")}
            returnKeyType={loading ? "default" : "done"}
            maxLength={6}
            onSubmitEditing={() => sendVerif()}
            >
            {code}
          </TextInput>
        </KeyboardAvoidingView>
        <View style={{ flex: 1 }} />
        <ActivityIndicator animating={loading} size="large" color={color.primary} />
        <View style={{ flex: 1 }} />
      </View>
    </Screen>
  )
})
