import { createStackNavigator } from "react-navigation-stack"
import { GetStartedScreen } from "../screens/login-screen"
import {
  WelcomeFirstSatsScreen,
  WelcomePhoneInputScreen,
  WelcomePhoneValidationScreen,
  WelcomeFirstScreen,
} from "../screens/welcome-screens"

import { DebugScreen } from "../screens/demo-screen"
import { color } from "../theme"

export const AuthNavigator = createStackNavigator(
  {
    getStarted: { screen: GetStartedScreen },
    demo: { screen: DebugScreen },
    welcomeFirst: { screen: WelcomeFirstScreen },
    welcomeFirstSats: { screen: WelcomeFirstSatsScreen },
    welcomePhoneInput: { screen: WelcomePhoneInputScreen },
    welcomePhoneValidation: { screen: WelcomePhoneValidationScreen },
  },
  {
    headerMode: "screen",
    defaultNavigationOptions: {
      title: "",
      headerTintColor: color.primary,
    },
  },
)
