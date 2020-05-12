import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"
import * as React from "react"
import { Button, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { translate } from "../i18n"
import { AccountDetailScreen } from "../screens/account-detail-screen/account-detail-screen"
import { AccountsScreen } from "../screens/accounts-screen"
import { BankAccountEarnScreen, BankAccountReadyScreen, DateOfBirthScreen, OpenBankScreen, PersonalInformationScreen } from "../screens/bank-onboarding"
import { DebugScreen } from "../screens/debug-screen"
import { EarnMapDataInjected } from "../screens/earns-map-screen"
import { EarnQuiz, EarnSection } from "../screens/earns-screen"
import { SectionCompleted } from "../screens/earns-screen/section-completed"
import { BankTransferScreen, DirectDepositScreen, FindATMScreen, MoveMoneyScreenDataInjected, ReceiveBitcoinScreen, ScanningQRCodeScreen, SendBitcoinScreen, ShowQRCode } from "../screens/move-money-screen"
import { WelcomePhoneInputScreen, WelcomePhoneValidationScreenDataInjected } from "../screens/phone-auth-screen"
import { TransactionDetailScreen } from "../screens/transaction-detail-screen"
import { palette } from "../theme/palette"
import { AccountType } from "../utils/enum"
import EStyleSheet from "react-native-extended-stylesheet"
import { TransactionScreenDataInjected } from "../screens/transaction-screen/transaction-screen"

const styles = EStyleSheet.create({
  person: {
    paddingRight: 15,
  },

  bottomNavigatorStyle: {
    height: '10%'
    // height: '60rem'
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
        component={WelcomePhoneValidationScreenDataInjected}
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
      <StackAccounts.Screen name="debug" component={DebugScreen} />
    </StackAccounts.Navigator>
  )
}

const StackMoveMoney = createStackNavigator()

export const MoveMoneyNavigator = () => {
  return (
    <StackMoveMoney.Navigator
      // headerMode="none"
    >
      <StackMoveMoney.Screen
        name="moveMoney"
        component={MoveMoneyScreenDataInjected}
        // options={{ title: translate("MoveMoneyScreen.title") }}
        options={{ 
          headerShown: false,
          title: "Move Money",
        }}
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
        name="showQRCode"
        component={ShowQRCode}
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
    // options={{ 
    //   headerShown: false,
    //   cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS
    // }}
      // headerMode="none"
    >
      <StackPhoneValidation.Screen
        name="welcomePhoneInput" 
        options={{ 
          headerShown: false,
          title: "Phone Number"
        }}
        component={WelcomePhoneInputScreen} />
      <StackPhoneValidation.Screen 
        name="welcomePhoneValidation" 
        component={WelcomePhoneValidationScreenDataInjected}
        options={{ 
          title: "",
        }}
      />
    </StackPhoneValidation.Navigator>
  )
}


const Tab = createBottomTabNavigator()

export const PrimaryNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Accounts"
      tabBarOptions={{
        activeTintColor: palette.lightBlue,
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
        name="Earn"
        component={EarnMapDataInjected}
        options={{
          title: translate("EarnScreen.title"),
          tabBarIcon: ({ focused, color }) => {
            return <Icon name={"ios-rocket"} size={size} color={color} />
          },
        }}
      />
      {/* <Tab.Screen
        name="Profile"
        component={DebugScreen}
        options={{
          title: "Profile", // FIXME
          tabBarIcon: ({ focused, color }) => {
            return <Icon name={"ios-settings"} size={size} color={color} />
          },
        }}
      /> */}
    </Tab.Navigator>
  )
}

const RootStack = createStackNavigator()

export const RootStackScreen = () => {
  return (
    <RootStack.Navigator mode="modal" headerMode="screen">
      <RootStack.Screen
        // name="Primary" // FIXME quick fixe
        name="Earn "
        component={PrimaryNavigator}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="earnsSection"
        component={EarnSection}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          headerStyle: {backgroundColor: palette.blue},
          headerTintColor: palette.white,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18
          },
        }}
      />
      <RootStack.Screen
        name="earnsQuiz"
        component={EarnQuiz}
        options={{ 
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      <RootStack.Screen
        name="Profile"
        component={DebugScreen}
      />
      <RootStack.Screen
        name="sectionCompleted"
        component={SectionCompleted}
        options={{ 
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS
        }}
      />
      <RootStack.Screen
        name="openBankAccount"
        component={BankAccountOnboardingNavigator}
        options={{ headerShown: false }}
      />
      <StackAccounts.Screen
        name="bankAccountEarn"
        component={BankAccountEarnScreen}
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

      <StackAccounts.Screen
        name="transactionHistory"
        component={TransactionScreenDataInjected}
        options={() => ({
          title: "Transaction History",
        })}
      />
      <StackAccounts.Screen
        name="accountDetail"
        component={AccountDetailScreen}
        options={{ 
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}  
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
    </RootStack.Navigator>
  )
}
