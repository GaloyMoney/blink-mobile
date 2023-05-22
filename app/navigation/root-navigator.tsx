import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"
import * as React from "react"

import {
  AuthenticationCheckScreen,
  AuthenticationScreen,
} from "../screens/authentication-screen"
import { PinScreen } from "../screens/authentication-screen/pin-screen"
import { ContactsDetailScreen, ContactsScreen } from "../screens/contacts-screen"
import { DebugScreen } from "../screens/debug-screen"
import { EarnMapScreen } from "../screens/earns-map-screen"
import { EarnQuiz, EarnSection } from "../screens/earns-screen"
import { SectionCompleted } from "../screens/earns-screen/section-completed"
import { GetStartedScreen } from "../screens/get-started-screen"
import { HomeScreen } from "../screens/home-screen"
import { MapScreen } from "../screens/map-screen/map-screen"

import { PriceHistoryScreen } from "../screens/price/price-history-screen"

import ContactsIcon from "@app/assets/icons/contacts.svg"
import HomeIcon from "@app/assets/icons/home.svg"
import LearnIcon from "@app/assets/icons/learn.svg"
import MapIcon from "@app/assets/icons/map.svg"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import {
  ConversionConfirmationScreen,
  ConversionDetailsScreen,
  ConversionSuccessScreen,
} from "@app/screens/conversion-flow"
import { GaloyAddressScreen } from "@app/screens/galoy-address-screen"
import ReceiveWrapperScreen from "@app/screens/receive-bitcoin-screen/receive-wrapper"
import RedeemBitcoinDetailScreen from "@app/screens/redeem-lnurl-withdrawal-screen/redeem-bitcoin-detail-screen"
import RedeemBitcoinResultScreen from "@app/screens/redeem-lnurl-withdrawal-screen/redeem-bitcoin-result-screen"
import SendBitcoinConfirmationScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-confirmation-screen"
import SendBitcoinDestinationScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-destination-screen"
import SendBitcoinDetailsScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-details-screen"
import SendBitcoinSuccessScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-success-screen"
import { AccountScreen } from "@app/screens/settings-screen/account-screen"
import { TransactionLimitsScreen } from "@app/screens/settings-screen/transaction-limits-screen"
import { ScanningQRCodeScreen } from "../screens/send-bitcoin-screen"
import { SettingsScreen } from "../screens/settings-screen"
import { LanguageScreen } from "../screens/settings-screen/language-screen"
import { SecurityScreen } from "../screens/settings-screen/security-screen"
import { TransactionDetailScreen } from "../screens/transaction-detail-screen"
import { TransactionHistoryScreen } from "../screens/transaction-history/transaction-history-screen"
import {
  ContactStackParamList,
  PhoneValidationStackParamList,
  PrimaryStackParamList,
  RootStackParamList,
} from "./stack-param-lists"
import { PhoneInputScreen } from "@app/screens/phone-auth-screen/phone-input"
import { PhoneValidationScreen } from "@app/screens/phone-auth-screen"
import { DisplayCurrencyScreen } from "@app/screens/settings-screen/display-currency-screen"
import { makeStyles, useTheme } from "@rneui/themed"
import { DefaultWalletScreen } from "@app/screens/settings-screen/default-wallet"

const useStyles = makeStyles(({ colors }) => ({
  bottomNavigatorStyle: {
    height: "10%",
    backgroundColor: colors.white,
    borderTopColor: colors.grey4,
  },
  headerStyle: {
    backgroundColor: colors.white,
  },
  title: {
    color: colors.black,
  },
}))

const RootNavigator = createStackNavigator<RootStackParamList>()

export const RootStack = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const isAuthed = useIsAuthed()
  const { LL } = useI18nContext()

  return (
    <RootNavigator.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerBackTitle: LL.common.back(),
        headerStyle: styles.headerStyle,
        headerTitleStyle: styles.title,
        headerBackTitleStyle: styles.title,
        headerTintColor: colors.black,
      }}
      initialRouteName={isAuthed ? "authenticationCheck" : "getStarted"}
    >
      <RootNavigator.Screen
        name="getStarted"
        component={GetStartedScreen}
        options={{ headerShown: false, animationEnabled: false }}
      />
      <RootNavigator.Screen
        name="authenticationCheck"
        component={AuthenticationCheckScreen}
        options={{ headerShown: false, animationEnabled: false }}
      />
      <RootNavigator.Screen
        name="authentication"
        component={AuthenticationScreen}
        options={{ headerShown: false, animationEnabled: false }}
      />
      <RootNavigator.Screen
        name="pin"
        component={PinScreen}
        options={{ headerShown: false }}
      />
      <RootNavigator.Screen
        name="Primary"
        component={PrimaryNavigator}
        options={{
          headerShown: false,
          animationEnabled: false,
          title: LL.PrimaryScreen.title(),
        }}
      />
      <RootNavigator.Screen
        name="scanningQRCode"
        component={ScanningQRCodeScreen}
        options={{
          title: LL.ScanningQRCodeScreen.title(),
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <RootNavigator.Screen
        name="sendBitcoinDestination"
        component={SendBitcoinDestinationScreen}
        options={{ title: LL.SendBitcoinScreen.title() }}
      />
      <RootNavigator.Screen
        name="sendBitcoinDetails"
        component={SendBitcoinDetailsScreen}
        options={{ title: LL.SendBitcoinScreen.title() }}
      />
      <RootNavigator.Screen
        name="sendBitcoinConfirmation"
        component={SendBitcoinConfirmationScreen}
        options={{ title: LL.SendBitcoinScreen.title() }}
      />
      <RootNavigator.Screen
        name="sendBitcoinSuccess"
        component={SendBitcoinSuccessScreen}
        options={{ title: LL.SendBitcoinScreen.title() }}
      />
      <RootNavigator.Screen
        name="receiveBitcoin"
        component={ReceiveWrapperScreen}
        options={{
          title: LL.ReceiveWrapperScreen.title(),
        }}
      />
      <RootNavigator.Screen
        name="redeemBitcoinDetail"
        component={RedeemBitcoinDetailScreen}
        options={{
          title: LL.RedeemBitcoinScreen.title(),
        }}
      />
      <RootNavigator.Screen
        name="redeemBitcoinResult"
        component={RedeemBitcoinResultScreen}
        options={{
          title: LL.RedeemBitcoinScreen.title(),
        }}
      />
      <RootNavigator.Screen
        name="conversionDetails"
        component={ConversionDetailsScreen}
        options={{
          title: LL.ConversionDetailsScreen.title(),
        }}
      />
      <RootNavigator.Screen
        name="conversionConfirmation"
        component={ConversionConfirmationScreen}
        options={{
          title: LL.ConversionConfirmationScreen.title(),
        }}
      />
      <RootNavigator.Screen
        name="conversionSuccess"
        component={ConversionSuccessScreen}
        options={{
          headerShown: false,
          title: LL.ConversionSuccessScreen.title(),
        }}
      />
      <RootNavigator.Screen
        name="earnsSection"
        component={EarnSection}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          headerStyle: { backgroundColor: colors._blue },
          headerTintColor: colors._white,
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
          },
        }}
      />
      <RootNavigator.Screen
        name="earnsQuiz"
        component={EarnQuiz}
        options={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      <RootNavigator.Screen
        name="settings"
        component={SettingsScreen}
        options={() => ({
          title: LL.SettingsScreen.title(),
        })}
      />
      <RootNavigator.Screen
        name="addressScreen"
        component={GaloyAddressScreen}
        options={() => ({
          title: "",
        })}
      />
      <RootNavigator.Screen
        name="defaultWallet"
        component={DefaultWalletScreen}
        options={() => ({
          title: LL.DefaultWalletScreen.title(),
        })}
      />
      <RootNavigator.Screen
        name="language"
        component={LanguageScreen}
        options={{ title: LL.common.languagePreference() }}
      />
      <RootNavigator.Screen
        name="currency"
        component={DisplayCurrencyScreen}
        options={{ title: LL.common.currency() }}
      />
      <RootNavigator.Screen
        name="security"
        component={SecurityScreen}
        options={{ title: LL.common.security() }}
      />
      <RootNavigator.Screen name="Debug" component={DebugScreen} />
      <RootNavigator.Screen
        name="sectionCompleted"
        component={SectionCompleted}
        options={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      <RootNavigator.Screen
        name="phoneFlow"
        component={PhoneValidationNavigator}
        options={{
          title: LL.PhoneInputScreen.title(),
        }}
      />
      <RootNavigator.Screen
        name="transactionDetail"
        component={TransactionDetailScreen}
        options={{
          headerShown: false,
          // cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}
      />
      <RootNavigator.Screen
        name="transactionHistory"
        component={TransactionHistoryScreen}
        options={{ title: LL.TransactionScreen.transactionHistoryTitle() }}
      />
      <RootNavigator.Screen
        name="priceHistory"
        component={PriceHistoryScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          title: LL.common.bitcoinPrice(),
        }}
      />
      <RootNavigator.Screen
        name="accountScreen"
        component={AccountScreen}
        options={{
          title: LL.common.account(),
        }}
      />
      <RootNavigator.Screen
        name="transactionLimitsScreen"
        component={TransactionLimitsScreen}
        options={{
          title: LL.common.transactionLimits(),
        }}
      />
    </RootNavigator.Navigator>
  )
}

const StackContacts = createStackNavigator<ContactStackParamList>()

export const ContactNavigator = () => {
  const { LL } = useI18nContext()
  return (
    <StackContacts.Navigator>
      <StackContacts.Screen
        name="contactList"
        component={ContactsScreen}
        options={{
          title: LL.ContactsScreen.title(),
          headerShown: false,
        }}
      />
      <StackContacts.Screen
        name="contactDetail"
        component={ContactsDetailScreen}
        options={{ headerShown: false }}
      />
    </StackContacts.Navigator>
  )
}
const StackPhoneValidation = createStackNavigator<PhoneValidationStackParamList>()

export const PhoneValidationNavigator = () => {
  const { LL } = useI18nContext()
  return (
    <StackPhoneValidation.Navigator>
      <StackPhoneValidation.Screen
        name="phoneInput"
        options={{
          headerShown: false,
          title: LL.common.phoneNumber(),
        }}
        component={PhoneInputScreen}
      />
      <StackPhoneValidation.Screen
        name="phoneValidation"
        component={PhoneValidationScreen}
        options={{
          headerShown: false,
        }}
      />
    </StackPhoneValidation.Navigator>
  )
}

const Tab = createBottomTabNavigator<PrimaryStackParamList>()

type TabProps = {
  color: string
}

export const PrimaryNavigator = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const { LL } = useI18nContext()
  // The cacheId is updated after every mutation that affects current user data (balanace, contacts, ...)
  // It's used to re-mount this component and thus reset what's cached in Apollo (and React)

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.grey2,
        tabBarStyle: styles.bottomNavigatorStyle,
        tabBarLabelStyle: { paddingBottom: 6, fontSize: 12, fontWeight: "bold" },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: LL.HomeScreen.title(),
          tabBarIcon: ({ color }: TabProps) => (
            <HomeIcon fill="currentColor" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactNavigator}
        options={{
          headerShown: false,
          title: LL.ContactsScreen.title(),
          tabBarIcon: ({ color }: TabProps) => (
            <ContactsIcon fill="currentColor" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: LL.MapScreen.title(),
          headerShown: false,
          tabBarIcon: ({ color }: TabProps) => <MapIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Earn"
        component={EarnMapScreen}
        options={{
          title: LL.EarnScreen.title(),
          headerShown: false,
          tabBarIcon: ({ color }: TabProps) => (
            <LearnIcon fill="currentColor" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
