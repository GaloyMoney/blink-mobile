import * as React from "react"
import { RootStackScreen } from "./primary-navigator"
import { createStackNavigator } from "@react-navigation/stack"
import { GetStartedScreen } from "../screens/get-started-screen"
import { DebugScreen } from "../screens/debug-screen"
import { WelcomeFirstScreen } from "../screens/welcome-screens"

import { inject, observer } from "mobx-react"

import auth from "@react-native-firebase/auth"
import { useEffect, useState } from "react"
import { when } from "mobx"
import { Onboarding } from "types"
import { SplashScreen } from "../screens/splash-screen"
import { onLoggedinSuccess } from "../screens/phone-auth-screen"

const Loading = createStackNavigator()

export const RootStack = inject("dataStore")(
  observer(({ dataStore }) => {
    const [initialRouteName, setInitialRouteName] = useState("")

    const onAuthStateChanged = async (user) => {
      console.tron.log(`onAuthStateChanged`, user)
      console.log(`onAuthStateChanged`, user)

      if (user == null) {
        await auth().signInAnonymously()
      } else if (user.phoneNumber) { 
        onLoggedinSuccess({ dataStore })
      }

      if (dataStore.onboarding.has(Onboarding.walletDownloaded)) {
        setInitialRouteName("primaryStack")
      } else {
        // new install
        setInitialRouteName("getStarted")
      }
    }

    useEffect(() => {
      const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
      return subscriber // unsubscribe on unmount
    }, [])

    if (initialRouteName === "") {
      return <SplashScreen />
    }

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
  }),
)
