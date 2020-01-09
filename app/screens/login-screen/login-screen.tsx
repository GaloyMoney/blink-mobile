import * as React from "react"
import { useEffect } from "react"
import { observer, inject } from "mobx-react"
import { Screen } from "../../components/screen"
import { withNavigation } from "react-navigation"
import { Text, Alert, StyleSheet, View } from "react-native"
import { Input, Button } from 'react-native-elements'

import auth from '@react-native-firebase/auth'
import { color } from "../../theme"
import { getEnv } from "mobx-state-tree"
import { loadString, saveString } from "../../utils/storage"
import { PendingOpenChannelsStatus } from "../../models/data-store"

const styles = StyleSheet.create({
  bottom: {
    alignItems: "center",
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36,
    marginLeft: 0,
    width: '70%'
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
    backgroundColor: color.primary
  },

  signUp: {
    color: color.text
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
  }

})

export enum OnboardingSteps {
  phoneValidated = "phoneValidated", // TODO use firebase auth instead of twilio
  channelCreated = "channelCreated",
  fullyOnboarded = "rewardGiven",
}

export const GetStartedScreen = withNavigation(inject("dataStore")(observer(
  ({dataStore, navigation}) => {
  // this should always get executed

  getEnv(dataStore).lnd.start()

  useEffect(() => {
    const getCurrentOnboardingStep = async () => {

    //  await saveString('onboarding', '') // for debug FIXME

      const onboard = await loadString('onboarding') // TODO: move this to mst
      console.tron.log(`onboard ${onboard}`)
      switch(onboard) {
        case OnboardingSteps.phoneValidated: {
          navigation.navigate('welcomeSyncing')
          break
        }
        case OnboardingSteps.channelCreated: {
          // TODO: as it takes time to load the status, have an intermediary screen
          const statusChannel = await dataStore.lnd.statusFirstChannelOpen()
          console.tron.log(`statusChannel : ${statusChannel}`)
          switch (statusChannel) {
            case PendingOpenChannelsStatus.pending: {
              navigation.navigate('welcomeGenerating')
              break
            }
            case PendingOpenChannelsStatus.opened: {
              navigation.navigate('welcomebackCompleted')
              break
            }
            default:
              console.tron.error('statusChannel state management error')
              break
          }
          break
        }
        case OnboardingSteps.fullyOnboarded: {
          navigation.navigate('primaryStack')
          break
        }
        default:
          console.tron.log('no onboarding string')
      }
    }

    getCurrentOnboardingStep()
  }, [])

  return (
    TemplateLoginScreen({dataStore, navigation, screen: "getStarted"})
  )
})))

GetStartedScreen.navigationOptions = () => ({
  headerShown: false
});

export const LoginScreen = withNavigation(inject("dataStore")(observer(
  ({dataStore, navigation}) => {
  return (
    TemplateLoginScreen({dataStore, navigation, screen: "subLogin"})
  )
})))

const TemplateLoginScreen = ({dataStore, navigation, screen}) => {
  const onAuthStateChanged = (user) => { // TODO : User type
    console.tron.warn(user)
    if (user === null) {
      return
    }

    if (user.emailVerified === true) {
      navigation.navigate('primaryStack') // we are logged in and email verified
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber; // unsubscribe on unmount
  }, [])

  let subScreen
  if (screen === 'getStarted') {
    subScreen = <SubGetStarted dataStore={dataStore} navigation={navigation} />
  } else if (screen === 'subLogin') {
    subScreen = <SubLogin dataStore={dataStore} navigation={navigation}  />
  }

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Galoy</Text>
      <Text style={styles.sub}>The bank built for crypto</Text>
        {subScreen}
    </Screen>
  )
}

const SubGetStarted = (({dataStore, navigation}) => {
  return (
    <>
      <Button title="debugScreen" onPress={() => navigation.navigate('demo')}></Button>
      <View style={styles.bottom}>
        <Button title="Log in" titleStyle={styles.signUp}
          onPress={() => navigation.navigate('login')} type="clear" containerStyle={styles.buttonContainer} />
        <Button title="Get Started" buttonStyle={styles.signIn}
          onPress={() => navigation.navigate('welcomeGaloy')} containerStyle={styles.buttonContainer}/>
      </View>
    </>
  )
})

const SubLogin = ({dataStore, navigation}) => {

  const [password, setPassword] = React.useState("")
  const [email, setEmail] = React.useState("")

  const signIn = () => {
    console.tron.warn(`sign in with ${email} and ${password}`)
    auth().signInWithEmailAndPassword(email, password)
      .catch(err => Alert.alert(err.code))
  }

  return (
    <>
      <Input placeholder="email" 
        value={email}
        onChangeText={email => setEmail(email)}
        inputContainerStyle={styles.form}
      />
      <Input placeholder="password" value={password}
        onChangeText={input => setPassword(input)}
        inputContainerStyle={styles.form}
        textContentType="newPassword" // TODO(check how to integrate with iCloud keychain)
        secureTextEntry={true}
      />
      <View style={styles.bottom}>
        <Button title="Sign in" buttonStyle={styles.signIn}
          onPress={() => signIn()} containerStyle={styles.buttonContainer}/>
      </View>
    </>
)}