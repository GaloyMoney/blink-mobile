import { createStackNavigator } from "react-navigation-stack"
import { GetStartedScreen } from "../screens/login-screen"
import {
  WelcomeFirstScreen,
} from "../screens/welcome-screens"

import { DebugScreen } from "../screens/debug-screen"
import { color } from "../theme"

export const AuthNavigator = createStackNavigator(
  {
    getStarted: { screen: GetStartedScreen },
    debug: { screen: DebugScreen },
    welcomeFirst: { screen: WelcomeFirstScreen },
  },
  {
    headerMode: "screen",
    defaultNavigationOptions: {
      title: "",
      headerTintColor: color.primary,
    },
  },
)
