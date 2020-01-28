import { createStackNavigator } from "react-navigation-stack"
import { GetStartedScreen, LoginScreen } from "../screens/login-screen"
import {
  WelcomeBitcoinScreen,
  WelcomeBankScreen,
  WelcomeEarnScreen,
  WelcomeFirstSatsScreen,
} from "../screens/welcome-screens"

import { WelcomePhoneInputScreen, WelcomePhoneValidationScreen } from "../screens/welcome-phone"
import { DebugScreen } from "../screens/demo-screen"
import { color } from "../theme"

export const AuthNavigator = createStackNavigator(
  {
    getStarted: { screen: GetStartedScreen },
    login: { screen: LoginScreen },
    demo: { screen: DebugScreen },
    welcomeEarn: { screen: WelcomeEarnScreen },
    welcomeBitcoin: { screen: WelcomeBitcoinScreen },
    welcomeBank: { screen: WelcomeBankScreen },
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

// export const WalletCompletedNavigator = createStackNavigator(
//   {
//     welcomebackCompleted: { screen: WelcomeBackCompletedScreen },
//     firstReward: { screen: FirstRewardScreen },
//     allDone: { screen: AllDoneScreen },
//   },
//   {
//     headerMode: "none",
//   },
// )
