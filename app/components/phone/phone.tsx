import * as React from "react"
import { useState } from "react"
import { Text } from "../text"
import { StyleSheet, View, Image } from "react-native"
import { Button } from 'react-native-elements'
import { bowserLogo } from "."
import { withNavigation } from 'react-navigation';
import { TextInput } from "react-native-gesture-handler"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },

  text: {
    fontSize: 18,
    textAlign: "center",
  }
})

const _Phone = ({ text, next, navigation, header = "" }) => {
  const [phone, setPhone] = useState("");

  return (
    <View style={styles.container}>
        <Text style={styles.text}>{header}</Text>
        <Image source={bowserLogo} />
        <Text style={styles.text}>{text}</Text>
        <TextInput style={styles.text} onChangeText={input => (setPhone(input))}>{phone}</TextInput>
        <Button title="Next" onPress={() => navigation.navigate(next)} containerStyle={styles.buttonContainer}/>
  </View>
  )
}

export const Phone = withNavigation(_Phone)
