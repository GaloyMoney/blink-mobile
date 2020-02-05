import { createSwitchNavigator } from "react-navigation"
import { PrimaryNavigator, BankAccountOnboardingNavigator } from "./primary-navigator"
import { AuthNavigator } from "./auth-navigator"
import { LoadingScreen } from "../screens/loading-screen"


export const RootNavigator = createSwitchNavigator({
  loadingScreen: { screen: LoadingScreen },
  authStack: { screen: AuthNavigator },
  primaryStack: { screen: PrimaryNavigator },
  openBankAccount: { screen: BankAccountOnboardingNavigator },
})
