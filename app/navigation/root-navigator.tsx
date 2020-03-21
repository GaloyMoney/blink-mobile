import * as React from "react"
import { PrimaryNavigator, BankAccountOnboardingNavigator } from "./primary-navigator"
import { createStackNavigator } from '@react-navigation/stack';
import { GetStartedScreen } from "../screens/login-screen";
import { DebugScreen } from "../screens/debug-screen";
import { WelcomeFirstScreen } from "../screens/welcome-screens";
import { View, ActivityIndicator } from "react-native";
import { VersionComponent } from "../components/version";
import { color } from "../theme";
import { inject, observer } from "mobx-react";

import auth from "@react-native-firebase/auth"
import { getEnv } from "mobx-state-tree"
import { useEffect, useState } from "react"
import { StyleSheet } from "react-native"
import { when } from "mobx"
import { Onboarding } from "types"

const INIT_DELAY_LND = 100

const styles = StyleSheet.create({
  centerBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
  },
})

const SplashScreen = () => (
  <View style={styles.centerBackground}>
    <ActivityIndicator style={{ flex: 1 }} size="large" color={color.primary} />
    <VersionComponent style={{ paddingVertical: 30 }} />
  </View>
)

const Stack = createStackNavigator()

export const RootStack = inject("dataStore")(
  observer(({ dataStore }) => {

    const [initialRouteName, setInitialRouteName] = useState("")
    const [authReady, setAuthReady] = useState(false)

    useEffect(() => {
      const startLnd = async () => {
        getEnv(dataStore).lnd.start()
      }

      startLnd()

      setTimeout(async function() {
        await getEnv(dataStore).lnd.openWallet()
      }, INIT_DELAY_LND)
    }, [])

    const onAuthStateChanged = async user => {
      console.tron.log(`onAuthStateChanged`, user)
      console.log(`onAuthStateChanged`, user)

      if (user == null) {
        await auth().signInAnonymously()
      } else setAuthReady(true)
    }

    useEffect(() => {
      const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
      return subscriber // unsubscribe on unmount
    }, [])

    useEffect(() => {
      const _ = async () => {
        await when(() => dataStore.lnd.lndReady === true)
        when(() => authReady)

        if (dataStore.onboarding.has(Onboarding.walletDownloaded)) {
          setInitialRouteName("primaryStack")
        } else {
          // new install
          setInitialRouteName("getStarted")
        }
      }

      _()
    }, [])

  if (initialRouteName === "") {
    return <SplashScreen />
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ gestureEnabled: false }}
    >
      <Stack.Screen
        name="getStarted"
        component={GetStartedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="debug"
        component={DebugScreen}
      />
      <Stack.Screen
        name="welcomeFirst"
        component={WelcomeFirstScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="primaryStack"
        component={PrimaryNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="openBankAccount"
        component={BankAccountOnboardingNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}))
