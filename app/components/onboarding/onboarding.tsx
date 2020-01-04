import * as React from "react"
import { Text } from "../../components/text"
import { StyleSheet, View, Image } from "react-native"
import { Button } from 'react-native-elements'
import { bowserLogo } from "."
import { withNavigation } from 'react-navigation';

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

const _Onboarding = ({ text, next, navigation, header = "" }) => {
  return (
    <View style={styles.container}>
        <Text style={styles.text}>{header}</Text>
        <Image source={bowserLogo} />
        <Text style={styles.text}>{text}</Text>
        <Button title="Next" onPress={() => navigation.navigate(next)} containerStyle={styles.buttonContainer}/>
  </View>
  )
}

export const Onboarding = withNavigation(_Onboarding)
