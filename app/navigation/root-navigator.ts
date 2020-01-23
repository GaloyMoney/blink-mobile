import { createSwitchNavigator } from "react-navigation"
import { PrimaryNavigator, BankAccountOnboardingNavigator } from "./primary-navigator"
import { AuthNavigator, WalletCompletedNavigator, SyncingNavigator } from "./auth-navigator"
import { WelcomeGeneratingWalletScreen } from "../screens/welcome-sync"
import { LoadingScreen } from "../screens/loading-screen"


export const RootNavigator = createSwitchNavigator({
  loadingScreen: { screen: LoadingScreen },
  authStack: { screen: AuthNavigator },
  primaryStack: { screen: PrimaryNavigator },
  openBankAccount: { screen: BankAccountOnboardingNavigator },
  syncingNavigator: { screen: SyncingNavigator },
  welcomeGenerating: { screen: WelcomeGeneratingWalletScreen },
  walletCompleted: { screen: WalletCompletedNavigator },
  bank: { screen: WalletCompletedNavigator },
})
