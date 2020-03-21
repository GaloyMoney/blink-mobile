import * as React from "react"
import { useState } from "react"
import { createStackNavigator } from '@react-navigation/stack'
import { DebugScreen } from "../screens/debug-screen"
import { AccountsScreen } from "../screens/accounts-screen"
import { AccountDetailScreen } from "../screens/account-detail-screen/account-detail-screen"
import { TransactionDetailScreen } from "../screens/transaction-detail-screen"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from "react-native-vector-icons/Ionicons"
import { Button as ButtonNative } from "react-native"

import { color } from "../theme"
import {
  RewardsScreen,
  WelcomePhoneInputScreen,
  WelcomePhoneValidationScreen,
  RewardsHome,
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
import { Animated, StyleSheet } from "react-native"
import { translate } from "../i18n"
import { palette } from "../theme/palette"


const styles = StyleSheet.create({
  person: {
    paddingRight: 15,
  },
})

const size = 32

const InteractiveBadge = 
  inject("dataStore")(
  // inject("navigationStore")(
    observer(({ dataStore, focused, color, routeName }) => {
      const [rotateAnim] = useState(new Animated.Value(0))

      // const primaryStack = navigationStore.state.routes.filter(
      //   item => item.key === "primaryStack",
      // )[0]
      // const rewardsActive = primaryStack.routes[primaryStack.index].key === "Rewards" ?? false

      const rewardsActive = true
      // FIXME
      // use focus?

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
            <Icon name={"ios-rocket"} size={size} color={color} />
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
)


const StackBankOpening = createStackNavigator()

export const BankAccountOnboardingNavigator = () => {
  return (
    <StackBankOpening.Navigator
      initialRouteName="accounts"
      // headerMode: "float",
    >
      <StackBankOpening.Screen
        name="openBankStart"
        component={OpenBankScreen}
        options={({navigation}) => ({
          title: translate("OpenBankScreen.title"),
          headerLeft: () => (
            <ButtonNative title="< Back" onPress={() => navigation.navigate("primaryStack")} />
          ),
          // FIXME < back button
        })}
      />
      <StackBankOpening.Screen
        name="welcomePhoneInputBanking"
        component={WelcomePhoneInputScreen}
      />
      <StackBankOpening.Screen
        name="welcomePhoneValidationBanking"
        component={WelcomePhoneValidationScreen}
      />
      <StackBankOpening.Screen
        name="personalInformation"
        component={PersonalInformationScreen}
        options={{title: translate("PersonalInformationScreen.title")}}
        />
      <StackBankOpening.Screen
        name="dateOfBirth"
        component={DateOfBirthScreen}
        options={{title: translate("DateOfBirthScreen.title")}}
      />
      <StackBankOpening.Screen
        name="bankAccountReady"
        component={BankAccountReadyScreen}
        options={{headerShown: false}}

      />
    </StackBankOpening.Navigator>
)}


const StackAccounts = createStackNavigator()

export const AccountNavigator = () => {
  return (
    <StackAccounts.Navigator
      initialRouteName="accounts"
      // headerMode: "float",
    >
      <StackAccounts.Screen
        name="accounts"
        component={AccountsScreen}
        options={({navigation}) => ({ 
          title: translate("AccountsScreen.title"),
          headerRight: () => (
            <Icon
              name={"ios-person"}
              size={32}
              color={palette.darkGrey}
              style={styles.person}
              onPress={() => navigation.navigate("debug")}
            />
        ),
        })}
      />
      <StackAccounts.Screen
        name="accountDetail"
        component={AccountDetailScreen}
      />
      <StackAccounts.Screen
        name="transactionDetail"
        component={TransactionDetailScreen}
      />
      <StackAccounts.Screen
        name="bankAccountRewards"
        component={BankAccountRewardsScreen}
        options={{ title: translate("BankAccountRewardsScreen.title") }}
      />
      <StackAccounts.Screen
        name="debug"
        component={DebugScreen}
      />
    </StackAccounts.Navigator>
)}

const StackMoveMoney = createStackNavigator()

export const MoveMoneyNavigator = () => {
  return (
    <StackMoveMoney.Navigator
      initialRouteName="accounts"
      // headerMode: "float",
    >
      <StackMoveMoney.Screen
        name="moveMoney"
        component={MoveMoneyScreen}
        options={{ title: translate("MoveMoneyScreen.title") }}
      />
      <StackMoveMoney.Screen
        name="sendBitcoin"
        component={SendBitcoinScreen}
        options={{ title: translate("SendBitcoinScreen.title") }}
        />
      <StackMoveMoney.Screen
        name="scanningQRCode"
        component={ScanningQRCodeScreen}
        options={{ title: translate("ScanningQRCodeScreen.title") }}
        />
      <StackMoveMoney.Screen
        name="receiveBitcoin"
        component={ReceiveBitcoinScreen}
        options={{ title: translate("ReceiveBitcoinScreen.title") }}
        />
      <StackMoveMoney.Screen
        name="bankTransfer"
        component={BankTransferScreen}
        options={{ title: translate("BankTransferScreen.title") }}
        />
      <StackMoveMoney.Screen
        name="directDeposit"
        component={DirectDepositScreen}
        options={{ title: translate("DirectDepositScreen.title") }}
      />
      <StackMoveMoney.Screen
        name="findATM"
        component={FindATMScreen}
      />
      <StackMoveMoney.Screen
        name="depositCash"
        component={FindATMScreen}
      />
    </StackMoveMoney.Navigator>
)}

const StackRewards = createStackNavigator()

export const RewardsNavigator = () => {
  return (
    <StackRewards.Navigator
      initialRouteName="accounts"
      // headerMode: "float",
    >
      <StackRewards.Screen
        name="rewards"
        component={RewardsHome}
        options={{ title: translate("RewardsScreen.title") }}
      />
      <StackRewards.Screen
        name="rewardsDetail"
        component={RewardsScreen}
      />
      <StackRewards.Screen
        name="welcomePhoneInput"
        component={WelcomePhoneInputScreen}
      />
      <StackRewards.Screen
        name="welcomePhoneValidation"
        component={WelcomePhoneValidationScreen}
      />
    </StackRewards.Navigator>
)}


const Tab = createBottomTabNavigator();

export const PrimaryNavigator =  () => {

  return (
    <Tab.Navigator
      initialRouteName="Accounts"
      tabBarOptions={{
        activeTintColor: color.primary,
        inactiveTintColor: color.text,
        style: { height: 100 },
      }}
      >
      <Tab.Screen 
        name="Accounts"
        component={AccountNavigator}
        options={{
          // title: translate("AccountsScreen.title"),
          tabBarIcon: ({ focused, color }) => {
            return <Icon name={"ios-wallet"} size={size} color={color} />
          },
        }}/>
      <Tab.Screen 
        name="MoveMoney"
        component={MoveMoneyNavigator}
        options={{
          title: translate("MoveMoneyScreen.title"),
          tabBarIcon: ({ focused, color }) => {
            return <Icon name={"ios-swap"} size={size} color={color} />
          },
        }}
        />
      <Tab.Screen 
        name="Rewards"
        component={RewardsNavigator}
        options={{title: translate("RewardsScreen.title"),
        tabBarIcon: ({ focused, color }) => {
          return <InteractiveBadge focused={focused} color={color} />
        },
      }}
        />
    </Tab.Navigator>
)}
