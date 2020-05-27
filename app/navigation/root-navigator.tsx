import * as React from "react"
import { RootStackScreen } from "./primary-navigator"
import { createStackNavigator } from "@react-navigation/stack"
import { GetStartedScreen } from "../screens/get-started-screen"
import { DebugScreen } from "../screens/debug-screen"
import { WelcomeFirstScreen } from "../screens/welcome-screens"

import { inject, observer } from "mobx-react"

import auth from "@react-native-firebase/auth"
import { useEffect, useState } from "react"
import { Onboarding } from "types"
import { SplashScreen } from "../screens/splash-screen"
import { StoreContext } from "../models"

const Loading = createStackNavigator()

export const RootStack = () => {
  const store = React.useContext(StoreContext)
  
  const [initialRouteName, setInitialRouteName] = useState("")

  const onAuthStateChanged = async (user) => {
    console.tron.log(`onAuthStateChanged`, user)

    if (user == null) {
      await auth().signInAnonymously()
      return 
    }

    if (user.phoneNumber) { // TODO have a private state for this (not attached to graphQL)
      setInitialRouteName("primaryStack")
    } else {
      setInitialRouteName("getStarted")
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber // unsubscribe on unmount
  }, [])

  console.tron.log({initialRouteName})

  if (initialRouteName === "") {
    return <SplashScreen />
  }

  console.tron.log({initialRouteName})

  return (
    <Loading.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ gestureEnabled: false }}
    >
      <Loading.Screen
        name="getStarted"
        component={GetStartedScreen}
        options={{ headerShown: false }}
      />
      <Loading.Screen name="debug" component={DebugScreen} />
      <Loading.Screen
        name="welcomeFirst"
        component={WelcomeFirstScreen}
        options={{ headerShown: false }}
      />
      <Loading.Screen
        name="primaryStack"
        component={RootStackScreen}
        options={{ headerShown: false }}
      />
    </Loading.Navigator>
  )
}
