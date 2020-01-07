import { createSwitchNavigator } from "react-navigation"
import { PrimaryNavigator } from "./primary-navigator"
import { AuthNavigator, WalletCompletedNavigator, SyncingNavigator } from "./auth-navigator"
import { WelcomeGeneratingWalletScreen } from "../screens/welcome-sync"

export const RootNavigator = createSwitchNavigator(
  {
    authStack: { screen: AuthNavigator },
    primaryStack: { screen: PrimaryNavigator },
    syncingNavigator : { screen: SyncingNavigator },
    welcomeGenerating: { screen: WelcomeGeneratingWalletScreen },
    walletCompleted : { screen: WalletCompletedNavigator },
  },
)
