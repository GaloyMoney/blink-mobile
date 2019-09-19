import { createStackNavigator } from "react-navigation-stack"
import { WelcomeScreen } from "../screens/welcome-screen"
import { DemoScreen } from "../screens/demo-screen"
import { AccountsScreen } from "../screens/accounts-screen"
import { AccountDetailScreen } from "../screens/account-detail-screen/account-detail-screen"
import { TransactionDetailScreen } from "../screens/transaction-detail-screen"
import { LoginScreen } from "../screens/login-screen"

export const PrimaryNavigator = createStackNavigator(
  {
    login: { screen: LoginScreen },
    accounts: { screen: AccountsScreen },
    account_detail: { screen: AccountDetailScreen },
    transaction_detail: { screen: TransactionDetailScreen },
    welcome: { screen: WelcomeScreen },
    demo: { screen: DemoScreen },
  },
  {
    headerMode: "float",
  },
)
