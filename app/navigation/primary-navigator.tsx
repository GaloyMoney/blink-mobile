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
import { MoveMoneyScreen, SendBitcoinScreen, ScanningQRCodeScreen, ReceiveBitcoinScreen } from "../screens/move-money-screen"
import { OpenBankAccountScreen, BankRewardsScreen, PersonalInformationScreen } from "../screens/bank-onboarding"
import { EnableNotificationsScreen } from "../screens/enable-notifications"

export const AccountNavigator = createStackNavigator(
  {
    accounts: { screen: AccountsScreen },
    accountDetail: { screen: AccountDetailScreen },
    transactionDetail: { screen: TransactionDetailScreen },
    openBankAccount: { screen : OpenBankAccountScreen },

    demo: { screen: DebugScreen },
    enableNotifications: { screen: EnableNotificationsScreen },
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
    receiveBitcoin: { screen : ReceiveBitcoinScreen }
  },
  {
    headerMode: "float",
  },
)

export const RewardsNavigator = createStackNavigator(
  {
    rewards: { screen: RewardsScreen },
    bankRewards: { screen: BankRewardsScreen },
    personalInformation: { screen: PersonalInformationScreen },
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
