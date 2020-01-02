import { createStackNavigator } from "react-navigation-stack"
import { WrappedLoginScreen } from "../screens/login-screen"
import { VerifyEmailScreen } from "../screens/verify-email-screen"

export const AuthNavigator = createStackNavigator(
  {
    login: { screen: WrappedLoginScreen },
    verifyEmail: { screen: VerifyEmailScreen },
  },
  {
    headerMode: "none",
  },
)
