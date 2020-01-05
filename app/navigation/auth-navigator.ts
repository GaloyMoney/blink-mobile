import { createStackNavigator } from "react-navigation-stack"
import { LoginScreen } from "../screens/login-screen"
import { VerifyEmailScreen } from "../screens/verify-email-screen"

export const AuthNavigator = createStackNavigator(
  {
    login: { screen: LoginScreen },
    verifyEmail: { screen: VerifyEmailScreen },
  },
  {
    headerMode: "none",
  },
)
