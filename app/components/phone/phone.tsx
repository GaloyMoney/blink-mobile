import * as React from "react"
import { useState } from "react"
import { Text } from "../text"
import { StyleSheet, View, Image, Alert } from "react-native"
import { Button } from 'react-native-elements'
import { bowserLogo } from "."
import { withNavigation } from 'react-navigation';
import { TextInput } from "react-native-gesture-handler"
import functions from "@react-native-firebase/functions"
import { color } from "../../theme"

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
  },

  buttonContainer: {
    paddingHorizontal: 80,
    marginBottom: 60,
  },

  buttonStyle: {
    backgroundColor: color.primary
  }
})

const _PhoneInit = ({ text, next, navigation, header = "" }) => {
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

  return (
    <>
      <View style={styles.container}>
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
      </View>
      <Button title="Next" 
                onPress={() => send()} 
                containerStyle={styles.buttonContainer}
                buttonStyle={styles.buttonStyle}
                />
    </>
  )
}

const _PhoneVerif = ({ text, next, navigation, header = "" }) => {
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
      navigation.navigate(next)
    } else {
      let message = 'error'
      message += result.data.reason
      Alert.alert(message)
    }
  };

  return (
   <>
   <View style={styles.container}>
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
    </View>
      <Button title="Next" 
              onPress={() => sendVerif()} 
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.buttonStyle}
              />
    </>
  )
}

export const PhoneVerif = withNavigation(_PhoneVerif)
export const PhoneInit = withNavigation(_PhoneInit)
