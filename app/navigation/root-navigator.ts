import { createSwitchNavigator } from "react-navigation"
import { PrimaryNavigator } from "./primary-navigator"
import { AuthNavigator, WalletCompletedNavigator, SyncingNavigator } from "./auth-navigator"
import { WelcomeGeneratingWalletScreen } from "../screens/welcome-sync"
import { LoadingScreen } from "../screens/loading-screen"

import { BankRewardsScreen, PersonalInformationScreen, DateOfBirthScreen, BankAccountReadyScreen } from "../screens/bank-onboarding"


export const BankAccountOnboardingNavigator = createSwitchNavigator({
  personalInformation: { screen: PersonalInformationScreen },
  bankRewardsStart: { screen: BankRewardsScreen },
  dateOfBirth: { screen: DateOfBirthScreen },
  bankAccountReady: { screen: BankAccountReadyScreen },
}) 

export const RootNavigator = createSwitchNavigator({
  loadingScreen: { screen: LoadingScreen },
  authStack: { screen: AuthNavigator },
  primaryStack: { screen: PrimaryNavigator },
  bankRewards: { screen: BankAccountOnboardingNavigator },
  syncingNavigator: { screen: SyncingNavigator },
  welcomeGenerating: { screen: WelcomeGeneratingWalletScreen },
  walletCompleted: { screen: WalletCompletedNavigator },
  bank: { screen: WalletCompletedNavigator },
})
