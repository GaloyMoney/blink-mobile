import * as React from "react"
import { useState } from "react"
import { createStackNavigator } from "react-navigation-stack"
import { DebugScreen } from "../screens/debug-screen"
import { AccountsScreen } from "../screens/accounts-screen"
import { AccountDetailScreen } from "../screens/account-detail-screen/account-detail-screen"
import { TransactionDetailScreen } from "../screens/transaction-detail-screen"
import { createBottomTabNavigator } from "react-navigation-tabs"
import Icon from "react-native-vector-icons/Ionicons"
import { color } from "../theme"
import {
  RewardsScreen,
  WelcomePhoneInputScreen,
  WelcomePhoneValidationScreen,
} from "../screens/rewards-screen"
import {
  MoveMoneyScreen,
  SendBitcoinScreen,
  ScanningQRCodeScreen,
  ReceiveBitcoinScreen,
  BankTransferScreen,
  DirectDepositScreen,
  FindATMScreen,
} from "../screens/move-money-screen"
import {
  BankAccountRewardsScreen,
  PersonalInformationScreen,
  OpenBankScreen,
  DateOfBirthScreen,
  BankAccountReadyScreen,
} from "../screens/bank-onboarding"
import { Badge } from "react-native-elements"
import { inject, observer } from "mobx-react"
import { Animated } from "react-native"
import { translate } from "../i18n"

export const BankAccountOnboardingNavigator = createStackNavigator(
  {
    openBankStart: { screen: OpenBankScreen },
    personalInformation: { screen: PersonalInformationScreen },
    dateOfBirth: { screen: DateOfBirthScreen },
    bankAccountReady: { screen: BankAccountReadyScreen },
  },
  {
    headerMode: "float",
  },
)

export const AccountNavigator = createStackNavigator(
  {
    accounts: { screen: AccountsScreen },
    accountDetail: { screen: AccountDetailScreen },
    transactionDetail: { screen: TransactionDetailScreen },
    bankAccountRewards: { screen: BankAccountRewardsScreen },

    debug: { screen: DebugScreen },
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
    receiveBitcoin: { screen: ReceiveBitcoinScreen },
    bankTransfer: { screen: BankTransferScreen },
    directDeposit: { screen: DirectDepositScreen },
    findATM: { screen: FindATMScreen },
    depositCash: { screen: FindATMScreen },
  },
  {
    headerMode: "float",
  },
)

export const RewardsNavigator = createStackNavigator(
  {
    rewards: { screen: RewardsScreen },
    welcomePhoneInput: { screen: WelcomePhoneInputScreen },
    welcomePhoneValidation: { screen: WelcomePhoneValidationScreen },
  },
  {
    headerMode: "float",
  },
)

const size = 32

const InteractiveBadge = inject("dataStore")(
  inject("navigationStore")(
    observer(({ navigationStore, dataStore, focused, tintColor, routeName }) => {
      const [rotateAnim] = useState(new Animated.Value(0))

      const primaryStack = navigationStore.state.routes.filter(
        item => item.key === "primaryStack",
      )[0]
      const rewardsActive = primaryStack.routes[primaryStack.index].key === "Rewards" ?? false

      React.useEffect(() => {
        if (rewardsActive) {
          return
        }

        const animate = () => {
          rotateAnim.setValue(0)

          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 500, // ms
          }).start()
        }

        const timer = setInterval(animate, 5000)

        return () => clearTimeout(timer)
      }, [rewardsActive])

      return (
        <>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 0.2, 0.8, 1],
                    outputRange: ["0deg", "10deg", "-10deg", "0deg"],
                  }),
                },
              ],
            }}
          >
            <Icon name={"ios-rocket"} size={size} color={tintColor} />
          </Animated.View>
          <Badge
            status="success"
            value={dataStore.onboarding.rewardsAvailable}
            containerStyle={{ position: "absolute", top: 5, right: 35 }}
            badgeStyle={{ backgroundColor: color.primary }}
          />
        </>
      )
    }),
  ),
)

export const PrimaryNavigator = createBottomTabNavigator(
  {
    Accounts: {
      screen: AccountNavigator,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => {
          return <Icon name={"ios-wallet"} size={size} color={tintColor} />
        },
        title: translate("AccountsScreen.title"),
      },
    },
    MoveMoney: {
      screen: MoveMoneyNavigator,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => {
          return <Icon name={"ios-swap"} size={size} color={tintColor} />
        },
        title: translate("MoveMoneyScreen.title"),
      },
    },
    Rewards: {
      screen: RewardsNavigator,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => {
          return <InteractiveBadge focused={focused} tintColor={tintColor} />
        },
        title: translate("RewardsScreen.title"),
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
