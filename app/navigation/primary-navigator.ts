import { createStackNavigator } from "react-navigation-stack"
import { WelcomeScreen } from "../screens/welcome-screen"
import { debugScreen } from "../screens/demo-screen"
import { AccountsScreen } from "../screens/accounts-screen"
import { AccountDetailScreen } from "../screens/account-detail-screen/account-detail-screen"
import { TransactionDetailScreen } from "../screens/transaction-detail-screen"

export const PrimaryNavigator = createStackNavigator(
  {
    accounts: { screen: AccountsScreen },
    demo: { screen: debugScreen },
    accountDetail: { screen: AccountDetailScreen },
    transactionDetail: { screen: TransactionDetailScreen },
    welcome: { screen: WelcomeScreen },
  },
  {
    headerMode: "float",
  },
)
