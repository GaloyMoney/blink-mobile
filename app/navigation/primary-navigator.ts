import { createStackNavigator } from "react-navigation-stack"
import { 
  WelcomeGaloyScreen, 
  WelcomeBitcoinScreen, 
  WelcomeBankScreen, 
  WelcomeEarnScreen,
  WelcomeFirstSatsScreen,
 } from "../screens/welcome-screens"
import { DebugScreen } from "../screens/demo-screen"
import { AccountsScreen } from "../screens/accounts-screen"
import { AccountDetailScreen } from "../screens/account-detail-screen/account-detail-screen"
import { TransactionDetailScreen } from "../screens/transaction-detail-screen"
import { WelcomePhoneInputScreen, WelcomePhoneValidationScreen } from "../screens/welcome-phone"
import { WelcomeSyncingScreen, WelcomeSyncCompletedScreen, WelcomeGeneratingWallet } from "../screens/welcome-sync"

export const PrimaryNavigator = createStackNavigator(
  {
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
    accounts: { screen: AccountsScreen },
    demo: { screen: DebugScreen },
    accountDetail: { screen: AccountDetailScreen },
    transactionDetail: { screen: TransactionDetailScreen },
  },
  {
    headerMode: "float",
  },
)