import { createStackNavigator } from "react-navigation-stack"
import { LoginScreen } from "../screens/login-screen"
import { VerifyEmailScreen } from "../screens/verify-email-screen"
import { 
  WelcomeGaloyScreen, 
  WelcomeBitcoinScreen, 
  WelcomeBankScreen, 
  WelcomeEarnScreen,
  WelcomeFirstSatsScreen,
 } from "../screens/welcome-screens"

 import { WelcomePhoneInputScreen, WelcomePhoneValidationScreen } from "../screens/welcome-phone"
 import { WelcomeSyncingScreen, WelcomeSyncCompletedScreen, WelcomeGeneratingWallet } from "../screens/welcome-sync" 

export const AuthNavigator = createStackNavigator(
  {
    login: { screen: LoginScreen },
    welcomeGaloy: { screen: WelcomeGaloyScreen },
    welcomeSyncing: { screen: WelcomeSyncingScreen },
    welcomeBitcoin: { screen: WelcomeBitcoinScreen },
    welcomeBank: { screen: WelcomeBankScreen },
    welcomeEarn: { screen: WelcomeEarnScreen },
    welcomeFirstSats: { screen: WelcomeFirstSatsScreen },
    welcomePhoneInput: { screen: WelcomePhoneInputScreen },
    welcomePhoneValidation: { screen: WelcomePhoneValidationScreen },
    welcomeSyncCompleted: { screen: WelcomeSyncCompletedScreen },
    welcomeGenerating: { screen: WelcomeGeneratingWallet },
    verifyEmail: { screen: VerifyEmailScreen },
  },
  {
    headerMode: "none",
  },
)
