import auth from "@react-native-firebase/auth"
import { inject, observer } from "mobx-react"
import * as React from "react"
import { useEffect } from "react"
import { Alert, StyleSheet, Text, View } from "react-native"
import { Button, Input } from "react-native-elements"
import { withNavigation } from "react-navigation"
import { Screen } from "../../components/screen"
import { color } from "../../theme"

const styles = StyleSheet.create({
  bottom: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 36,
    marginLeft: 0,
    width: "70%",
  },

  buttonContainer: {
    marginVertical: 12,
    width: "100%",
  },

  container: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },

  form: {
    marginHorizontal: 32,
    marginVertical: 12,
  },

  signIn: {
    backgroundColor: color.primary,
  },

  signUp: {
    color: color.text,
  },

  sub: {
    fontSize: 18,
    marginBottom: 48,
  },

  title: {
    color: color.primary,
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 24,
    marginTop: 128,
  },
})

export const GetStartedScreen = withNavigation(
  inject("dataStore")(
    observer(({ dataStore, navigation }) => {
      return TemplateLoginScreen({ dataStore, navigation, screen: "getStarted" })
    }),
  ),
)

GetStartedScreen.navigationOptions = () => ({
  headerShown: false,
})

export const LoginScreen = withNavigation(
  inject("dataStore")(
    observer(({ dataStore, navigation }) => {
      return TemplateLoginScreen({ dataStore, navigation, screen: "subLogin" })
    }),
  ),
)

const TemplateLoginScreen = ({ dataStore, navigation, screen }) => {
  let subScreen
  if (screen === "getStarted") {
    subScreen = <GetStartedComponent dataStore={dataStore} navigation={navigation} />
  } else if (screen === "subLogin") {
    subScreen = <LoginComponent dataStore={dataStore} navigation={navigation} />
  }

  return (
    <Screen style={styles.container}>
      <Text style={styles.title} onPress={() => navigation.navigate("demo")}>
        Galoy
      </Text>
      <Text style={styles.sub}>The bank built for crypto</Text>
      {subScreen}
    </Screen>
  )
}

const GetStartedComponent = ({ dataStore, navigation }) => {
  return (
    <>
      <View style={styles.bottom}>
        <Button
          title="Log in"
          titleStyle={styles.signUp}
          onPress={() => navigation.navigate("login")}
          type="clear"
          containerStyle={styles.buttonContainer}
        />
        <Button
          title="Get Started"
          buttonStyle={styles.signIn}
          onPress={() => navigation.navigate("welcomeGaloy")}
          containerStyle={styles.buttonContainer}
        />
      </View>
    </>
  )
}

const LoginComponent = ({ dataStore, navigation }) => {
  const onAuthStateChanged = user => {
    // TODO : User type
    console.tron.log(`onAuthStateChanged`, user)
    console.log(`onAuthStateChanged`, user)
    if (user === null) {
      return
    }

    if (user.emailVerified === true) {
      navigation.navigate("primaryStack") // we are logged in and email verified
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber // unsubscribe on unmount
  }, [])

  const [password, setPassword] = React.useState("")
  const [email, setEmail] = React.useState("")

  const signIn = () => {
    console.tron.warn(`sign in with ${email} and ${password}`)
    auth()
      .signInWithEmailAndPassword(email, password)
      .catch(err => Alert.alert(err.code))
  }

  return (
    <>
      <Input
        placeholder="email"
        value={email}
        onChangeText={email => setEmail(email)}
        inputContainerStyle={styles.form}
      />
      <Input
        placeholder="password"
        value={password}
        onChangeText={input => setPassword(input)}
        inputContainerStyle={styles.form}
        textContentType="newPassword" // TODO(check how to integrate with iCloud keychain)
        secureTextEntry={true}
      />
      <View style={styles.bottom}>
        <Button
          title="Sign in"
          buttonStyle={styles.signIn}
          onPress={() => signIn()}
          containerStyle={styles.buttonContainer}
        />
      </View>
    </>
  )
}
