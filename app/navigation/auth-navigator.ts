import { createStackNavigator } from "react-navigation-stack"
import { GetStartedScreen, LoginScreen } from "../screens/login-screen"
import { VerifyEmailScreen } from "../screens/verify-email-screen"
import { 
  WelcomeGaloyScreen, 
  WelcomeBitcoinScreen, 
  WelcomeBankScreen, 
  WelcomeEarnScreen,
  WelcomeFirstSatsScreen,
  WelcomeBackCompletedScreen,
  FirstRewardScreen,
  EnableNotificationsScreen,
  AllDoneScreen,
 } from "../screens/welcome-screens"

import { WelcomePhoneInputScreen, WelcomePhoneValidationScreen } from "../screens/welcome-phone"
import { WelcomeSyncingScreen, WelcomeSyncCompletedScreen, WelcomeGeneratingWalletScreen  } from "../screens/welcome-sync" 
import { DebugScreen } from "../screens/demo-screen"
import { color } from "../theme"


export const AuthNavigator = createStackNavigator(
  {
    getStarted: { screen: GetStartedScreen },
    login: { screen: LoginScreen },
    demo: { screen: DebugScreen },
    welcomeGaloy: { screen: WelcomeGaloyScreen },
    welcomeBitcoin: { screen: WelcomeBitcoinScreen },
    welcomeBank: { screen: WelcomeBankScreen },
    welcomeEarn: { screen: WelcomeEarnScreen },
    welcomeFirstSats: { screen: WelcomeFirstSatsScreen },
    welcomePhoneInput: { screen: WelcomePhoneInputScreen, },
    welcomePhoneValidation: { screen: WelcomePhoneValidationScreen },
    verifyEmail: { screen: VerifyEmailScreen },
  },
  {
    headerMode: "screen",
    defaultNavigationOptions: {
      title: '',
      headerTintColor: color.primary
    }
  },
)

export const SyncingNavigator = createStackNavigator(
  {
    welcomeSyncing: { screen: WelcomeSyncingScreen },
    welcomeSyncCompleted: { screen: WelcomeSyncCompletedScreen },
    welcomeGeneratingWallet: { screen: WelcomeGeneratingWalletScreen }, // TODO
  },
  {
    headerMode: "none"
  },
)

export const WalletCompletedNavigator = createStackNavigator(
  {
    welcomebackCompleted: { screen: WelcomeBackCompletedScreen },
    firstReward: { screen: FirstRewardScreen },
    enableNotifications: { screen: EnableNotificationsScreen },
    allDone: { screen: AllDoneScreen },
  },
  {
    headerMode: "none"
  },
)