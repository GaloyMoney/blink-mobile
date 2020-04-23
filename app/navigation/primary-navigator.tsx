import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"
import * as React from "react"
import { Button, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { translate } from "../i18n"
import { AccountDetailScreen } from "../screens/account-detail-screen/account-detail-screen"
import { AccountsScreen } from "../screens/accounts-screen"
import { BankAccountReadyScreen, BankAccountRewardsScreen, DateOfBirthScreen, OpenBankScreen, PersonalInformationScreen } from "../screens/bank-onboarding"
import { DebugScreen } from "../screens/debug-screen"
import { BankTransferScreen, DirectDepositScreen, FindATMScreen, MoveMoneyScreen, ReceiveBitcoinScreen, ScanningQRCodeScreen, SendBitcoinScreen } from "../screens/move-money-screen"
import { RewardsMapDataInjected } from "../screens/rewards-map-screen"
import { RewardsQuiz, RewardsSection, WelcomePhoneInputScreen, WelcomePhoneValidationScreen } from "../screens/rewards-screen"
import { TransactionDetailScreen } from "../screens/transaction-detail-screen"
import { color } from "../theme"
import { palette } from "../theme/palette"
import { AccountType } from "../utils/enum"

const styles = StyleSheet.create({
  person: {
    paddingRight: 15,
  },

  bottomNavigatorStyle: {
    height: '12%'
    // height: '12rem%'
    // height: 100
  }
})

const size = 32

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
        options={({ navigation }) => ({
          title: translate("OpenBankScreen.title"),
          headerLeft: () => <Button title="< Back" onPress={() => navigation.goBack()} />,
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
        options={{ title: translate("PersonalInformationScreen.title") }}
      />
      <StackBankOpening.Screen
        name="dateOfBirth"
        component={DateOfBirthScreen}
        options={{ title: translate("DateOfBirthScreen.title") }}
      />
      <StackBankOpening.Screen
        name="bankAccountReady"
        component={BankAccountReadyScreen}
        options={{ headerShown: false }}
      />
    </StackBankOpening.Navigator>
  )
}

const StackAccounts = createStackNavigator()

export const AccountNavigator = () => {
  return (
    <StackAccounts.Navigator
      initialRouteName={"accounts"}
      headerMode="float"
      // headerMode="none"
    >
      <StackAccounts.Screen
        name="accounts"
        component={AccountsScreen}
        options={() => ({
          title: translate("AccountsScreen.title"),
          headerShown: false
        })}
      />
      <StackAccounts.Screen
        name="accountDetail"
        component={AccountDetailScreen}
        // options={({ navigation }) => ({
        //   headerRight: () => (
        //     <Icon
        //       name={"ios-person"}
        //       size={32}
        //       color={palette.darkGrey}
        //       style={styles.person}
        //       onPress={() => navigation.navigate("debug")}
        //     />
        //   ),
        // })}
        initialParams={{ account: AccountType.Bitcoin }}
      />
      <StackAccounts.Screen name="debug" component={DebugScreen} />
    </StackAccounts.Navigator>
  )
}

const StackMoveMoney = createStackNavigator()

export const MoveMoneyNavigator = () => {
  return (
    <StackMoveMoney.Navigator
      headerMode="none"
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
      <StackMoveMoney.Screen name="findATM" component={FindATMScreen} />
      <StackMoveMoney.Screen name="depositCash" component={FindATMScreen} />
    </StackMoveMoney.Navigator>
  )
}

const StackPhoneValidation = createStackNavigator()

export const PhoneValidationNavigator = () => {
  return (
    <StackPhoneValidation.Navigator
      // headerMode="none"
    >
      <StackPhoneValidation.Screen name="welcomePhoneInput" component={WelcomePhoneInputScreen} />
      <StackPhoneValidation.Screen name="welcomePhoneValidation" component={WelcomePhoneValidationScreen} />
    </StackPhoneValidation.Navigator>
  )
}


const Tab = createBottomTabNavigator()

export const PrimaryNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Accounts"
      tabBarOptions={{
        activeTintColor: color.primary,
        inactiveTintColor: palette.lightGrey,
        style: styles.bottomNavigatorStyle,
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
        }}
      />
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
        component={RewardsMapDataInjected}
        options={{
          title: translate("RewardsScreen.title"),
          tabBarIcon: ({ focused, color }) => {
            return <Icon name={"ios-rocket"} size={size} color={color} />
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={DebugScreen}
        options={{
          title: "Profile", // FIXME
          tabBarIcon: ({ focused, color }) => {
            return <Icon name={"ios-settings"} size={size} color={color} />
          },
        }}
      />
    </Tab.Navigator>
  )
}

const RootStack = createStackNavigator()

export const RootStackScreen = () => {
  return (
    <RootStack.Navigator mode="modal" headerMode="screen">
      <RootStack.Screen
        name="Primary"
        component={PrimaryNavigator}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="rewardsSection"
        component={RewardsSection}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <RootStack.Screen
        name="rewardsQuiz"
        component={RewardsQuiz}
        options={{ 
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      <RootStack.Screen
        name="openBankAccount"
        component={BankAccountOnboardingNavigator}
        options={{ headerShown: false }}
      />
      <StackAccounts.Screen
        name="bankAccountRewards"
        component={BankAccountRewardsScreen}
        options={{ 
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}
      />
      <RootStack.Screen
        name="phoneValidation"
        component={PhoneValidationNavigator}
        options={{ 
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS
        }}
      />
      <RootStack.Screen 
        name="transactionDetail"
        component={TransactionDetailScreen}
        options={{ 
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}  
      />
    </RootStack.Navigator>
  )
}
