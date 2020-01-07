import { Screen } from "../../components/screen"

import * as React from "react"
import { useState } from "react"
import { Text } from "../../components/text"
import { StyleSheet, View, Image, Alert, KeyboardAvoidingView, Platform } from "react-native"
import { Button } from 'react-native-elements'
import { bowserLogo } from "."
import { withNavigation } from 'react-navigation';
import { TextInput } from "react-native-gesture-handler"
import functions from "@react-native-firebase/functions"
import { color } from "../../theme"
import { saveString } from "../../utils/storage"
import { OnboardingSteps } from "../../screens/login-screen"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },

  image: {
    alignSelf: 'center',
    padding: 20,
  },

  text: {
    fontSize: 20,
    textAlign: "center",
    paddingHorizontal: 40,
    paddingBottom: 10,
  },

  textEntry: {
    fontSize: 20,
    textAlign: "center",
    marginHorizontal: 60,
    padding: 12,
    borderColor: color.palette.darkGrey,
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 10,
    color: color.palette.darkGrey,
  },

  buttonContainer: {
    paddingHorizontal: 80,
    paddingVertical: 10,
  },

  buttonStyle: {
    backgroundColor: color.primary
  }
})


export const WelcomePhoneInputScreen = withNavigation(({ text, next, navigation, header = "" }) => {
  const [phone, setPhone] = useState("");
  
  const send = async () => {
    console.tron.log('initPhoneNumber')

    if (phone === "") {
      Alert.alert('need a phone number')
      return
    }

    const result = await functions().httpsCallable('initPhoneNumber')({phone})
    console.tron.log(result)
    navigation.navigate(next, {phone})
  };

  header="To receive your sats, first we need to activate your Bitcoin wallet." 
  text="This will take a little while, but we’ll send you a text you when it’s ready!" 
  next="welcomePhoneValidation" 

  return (
    <Screen>
      <KeyboardAvoidingView
        keyboardVerticalOffset={-110}
        behavior={(Platform.OS === 'ios')? "padding" : undefined}
        style={{ flex: 1}} >
          <View style={{flex: 1, justifyContent: "flex-end" }}>
          <View style={{ flex : 1 }} />
          <Text style={styles.text}>{header}</Text>
          <Image source={bowserLogo} />
          <Text style={styles.text}>{text}</Text>
          <TextInput  style={styles.textEntry} 
                      onChangeText={input => (setPhone(input))}
                      keyboardType="number-pad"
                      textContentType="telephoneNumber"
                      placeholder="Phone Number"
                      maxLength={12}
                      >
                        {phone}
          </TextInput>
          <View style={{ flex : 1 }} />
          <Button title="Next" 
                    onPress={() => send()} 
                    containerStyle={styles.buttonContainer}
                    buttonStyle={styles.buttonStyle}
                    />
          </View>
      </KeyboardAvoidingView>
    </Screen>
  )
})

export const WelcomePhoneValidationScreen = withNavigation(({ text, next, navigation, header = "" }) => {
  const [code, setCode] = useState("");
  const phone = navigation.getParam('phone');

  const sendVerif = async () => {
    const data = {code, phone}
    console.tron.log('verifyPhoneNumber', data)

    if (code === "") {
      Alert.alert('need a code')
      return
    }

    const result = await functions().httpsCallable('verifyPhoneNumber')(data)
    if (result.data.success) {
      saveString('onboarding', OnboardingSteps.phoneValidated)
      navigation.navigate(next)
    } else {
      let message = 'error'
      message += result.data.reason
      Alert.alert(message)
    }
  };

  text="To confirm your phone number, enter the code we just sent you." 
  next="welcomeSyncing" 

  return (
    <Screen>
      <KeyboardAvoidingView
        keyboardVerticalOffset={-110}
        behavior={(Platform.OS === 'ios')? "padding" : undefined}
          style={styles.container} >
        <View style={{ flex : 1 }} />
        <Text style={styles.text}>{header}</Text>
        <Image source={bowserLogo} />
        <Text style={styles.text}>{text}</Text>
        <TextInput  style={styles.textEntry} 
                    onChangeText={input => (setCode(input))}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    placeholder="6 Digits Code"
                    >
                      {code}
        </TextInput>
        <View style={{ flex : 1 }} />
        <Button title="Next" 
                  onPress={() => sendVerif()} 
                  containerStyle={styles.buttonContainer}
                  buttonStyle={styles.buttonStyle}
                  />
      </KeyboardAvoidingView>
    </Screen>
  )
})
