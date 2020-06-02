import { createStackNavigator } from "@react-navigation/stack"
import * as React from "react"
import { useEffect, useState } from "react"
import { DebugScreen } from "../screens/debug-screen"
import { GetStartedScreen } from "../screens/get-started-screen"
import { SplashScreen } from "../screens/splash-screen"
import { WelcomeFirstScreen } from "../screens/welcome-screens"
import { Token } from "../utils/token"
import { RootStackScreen } from "./primary-navigator"


const Loading = createStackNavigator()

export const RootStack = () => {
  const [initialRouteName, setInitialRouteName] = useState("")

  useEffect(() => {
    const _ = async () => {
      const token = new Token()
      console.tron.log({token})

      if (token.has()) {
        setInitialRouteName("primaryStack")
      } else {
        setInitialRouteName("getStarted")
      }
    }

    _()
  }, [])

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
