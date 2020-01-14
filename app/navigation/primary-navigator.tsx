import * as React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { DebugScreen } from "../screens/demo-screen"
import { AccountsScreen } from "../screens/accounts-screen"
import { AccountDetailScreen } from "../screens/account-detail-screen/account-detail-screen"
import { TransactionDetailScreen } from "../screens/transaction-detail-screen"
import { createBottomTabNavigator } from "react-navigation-tabs"
import Icon from "react-native-vector-icons/Ionicons"
import { color } from "../theme"
import { RewardsScreen } from "../screens/rewards-screen"
import { MoveMoneyScreen, SendBitcoinScreen, ScanningQRCodeScreen, FailurePayInvoiceScreen, SuccessPayInvoiceScreen, ReceiveBitcoinScreen } from "../screens/move-money-screen"

export const AccountNavigator = createStackNavigator(
  {
    accounts: { screen: AccountsScreen },
    demo: { screen: DebugScreen },
    accountDetail: { screen: AccountDetailScreen },
    transactionDetail: { screen: TransactionDetailScreen },
  },
  {
    headerMode: "float",
  },
)

export const MoveMoneyNavigator = createStackNavigator(
  {
    moveMoney: { screen: MoveMoneyScreen },
    sendBitcoin: { screen: SendBitcoinScreen },
    scanningQRCode: { screen: ScanningQRCodeScreen },
    failurePayInvoice: { screen: FailurePayInvoiceScreen },
    successPayInvoice: { screen: SuccessPayInvoiceScreen },
    receiveBitcoin: { screen : ReceiveBitcoinScreen }
  },
  {
    headerMode: "float",
  },
)

export const RewardsNavigator = createStackNavigator(
  {
    rewards: { screen: RewardsScreen },
  },
  {
    headerMode: "float",
  },
)

const size = 32

export const PrimaryNavigator = createBottomTabNavigator(
  {
    Accounts: {
      screen: AccountNavigator,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => {
          return <Icon name={"ios-wallet"} size={size} color={tintColor} />
        },
      },
    },
    MoveMoney: {
      screen: MoveMoneyNavigator,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => {
          return <Icon name={"ios-swap"} size={size} color={tintColor} />
        },
      },
    },
    Rewards: {
      screen: RewardsNavigator,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => {
          return <Icon name={"ios-rocket"} size={size} color={tintColor} />
        },
      },
    },
  },
  {
    tabBarOptions: {
      activeTintColor: color.primary,
      inactiveTintColor: color.text,
      style: { height: 64 },
    },
  },
)
