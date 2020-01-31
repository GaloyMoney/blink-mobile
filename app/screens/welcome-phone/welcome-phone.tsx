import { Screen } from "../../components/screen"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Text } from "../../components/text"
import { StyleSheet, View, Image, Alert, KeyboardAvoidingView, Platform } from "react-native"
import { Button } from "react-native-elements"
import { withNavigation } from "react-navigation"
import { TextInput, ScrollView } from "react-native-gesture-handler"
import { color } from "../../theme"
import PhoneInput from "react-native-phone-input"
import auth from "@react-native-firebase/auth"
import { isEmpty } from "ramda"
import { useNavigation, useNavigationParam } from "react-navigation-hooks"
import { inject } from "mobx-react"
import { Onboarding } from "types"

export const phoneLogo = require("./PhoneLogo.png")
export const phoneWithArrowLogo = require("./PhoneWithArrowLogo.png")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },

  image: {
    alignSelf: "center",
    padding: 20,
    height: 90,
    resizeMode: 'center',
  },

  text: {
    fontSize: 20,
    textAlign: "center",
    paddingHorizontal: 40,
    paddingBottom: 10,
  },

  phoneEntryContainer: {
    borderColor: color.palette.darkGrey,
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 10,
    marginHorizontal: 60,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  textEntry: {
    fontSize: 20,
    color: color.palette.darkGrey,
  },

  buttonContainer: {
    paddingHorizontal: 80,
    paddingVertical: 10,
  },

  buttonStyle: {
    backgroundColor: color.primary,
  },

  modalBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "#00000040",
  },
  activityIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    height: 100,
    width: 100,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
  },
})

export const WelcomePhoneInputScreen = withNavigation(({ text, navigation, header = "" }) => {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const inputRef = useRef()

  const send = async () => {
    console.tron.log(`initPhoneNumber ${inputRef.current.getValue()}`)

    if (!inputRef.current.isValidNumber()) {
      Alert.alert(`${inputRef.current.getValue()} is not a valid phone number`)
      return
    }

    try {
      setLoading(true)
      const confirmation = await auth().signInWithPhoneNumber(inputRef.current.getValue())
      console.tron.log(`confirmation`, confirmation)
      console.log(`confirmation`, confirmation)
      if (!isEmpty(confirmation)) {
        setLoading(false)
        navigation.navigate("welcomePhoneValidation", { confirmation })
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

  header = "To receive your sats, first we need to activate your Bitcoin wallet."
  text = "This will take a little while, but we’ll send you a text when it’s ready!"

  return (
    <Screen>
      <KeyboardAvoidingView
        keyboardVerticalOffset={-110}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <View style={{ flex: 1 }} />
          <Text style={styles.text}>{header}</Text>
          <Image source={phoneLogo} style={styles.image} />
          <Text style={styles.text}>{text}</Text>
          <PhoneInput 
            ref={inputRef}
            style={styles.phoneEntryContainer}
            textStyle={styles.textEntry}
            textProps={{
              autoFocus: true,
              placeholder: "Phone number",
              returnKeyType: 'done',
              onSubmitEditing: () => send(),
            }}
          />
          <View style={{ flex: 1 }} />
          <Button
            title="Next"
            onPress={() => send()}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.buttonStyle}
            loading={loading}
            disabled={loading}
            />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
})

export const WelcomePhoneValidationScreen = inject("dataStore")(
  ({ dataStore }) => {
    
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [err, setErr] = useState("")

  const confirmation = useNavigationParam("confirmation")
  const { navigate } = useNavigation()

  const onAuthStateChanged = async user => {
    // TODO : User type
    console.tron.log(`onAuthStateChanged`, user)
    console.log(`onAuthStateChanged`, user)
    if (user === null) {
      return
    }

    if (user.phoneNumber) {
      await dataStore.onboarding.add(Onboarding.walletDownloaded)
      setCompleted(true)
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber // unsubscribe on unmount
  }, [])

  const sendVerif = async () => {
    console.tron.log(`verifyPhoneNumber with code ${code}`)
    if (code.length !== 6) {
      Alert.alert(`code have 6 digits number`)
      return
    }
    try {
      setLoading(true)
      await confirmation.confirm(code)
      setLoading(false)
    } catch (err) {
      console.tron.error(err) // Invalid code
      setErr(err.toString())
    }
  }

  useEffect(() => {
    if (completed) {
      navigate("rewards")
    }
  }, [completed])

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

  const text = "To confirm your phone number, enter the code we just sent you."

  return (
    <Screen>
      <KeyboardAvoidingView
        keyboardVerticalOffset={-80}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView>
          <View style={{ flex: 1 }} />
          <Image source={phoneWithArrowLogo} style={styles.image} />
          <Text style={styles.text}>{text}</Text>
          <TextInput
            autoFocus={true}
            style={[styles.textEntry, styles.phoneEntryContainer]}
            onChangeText={input => setCode(input)}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            placeholder="6 Digits Code"
            returnKeyType='done'
            maxLength = {6}
            onSubmitEditing={() => sendVerif()}
          >
            {code}
          </TextInput>
          <View style={{ flex: 1 }} />
          <Button
            title="Next"
            onPress={() => sendVerif()}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.buttonStyle}
            loading={loading}
            disabled={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
})
