import { createStackNavigator } from "react-navigation-stack"
import { WelcomeScreen } from "../screens/welcome-screen"
import { DemoScreen } from "../screens/demo-screen"
import { AccountsScreen } from "../screens/accounts-screen"
import { AccountDetailScreen } from "../screens/account-detail-screen/account-detail-screen"
import { TransactionDetailScreen } from "../screens/transaction-detail-screen"

export const PrimaryNavigator = createStackNavigator(
  {
    demo: { screen: DemoScreen },
    welcome: { screen: WelcomeScreen },
    accounts: { screen: AccountsScreen },
    accountDetail: { screen: AccountDetailScreen },
    transactionDetail: { screen: TransactionDetailScreen },
  },
  {
    headerMode: "float",
  },
)
