/* eslint-disable react/display-name */
import { useApolloClient } from "@apollo/client"
import PushNotificationIOS from "@react-native-community/push-notification-ios"
import messaging from "@react-native-firebase/messaging"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"
import "node-libs-react-native/globals" // needed for Buffer?
import * as React from "react"
import { useCallback, useEffect } from "react"
import { AppState } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import * as RNLocalize from "react-native-localize"
import analytics from "@react-native-firebase/analytics"

import {
  AuthenticationScreen,
  AuthenticationCheckScreen,
} from "../screens/authentication-screen"
import { PinScreen } from "../screens/authentication-screen/pin-screen"
import { ContactsScreen, ContactsDetailScreen } from "../screens/contacts-screen"
import { DebugScreen } from "../screens/debug-screen"
import { EarnMapDataInjected } from "../screens/earns-map-screen"
import { EarnQuiz, EarnSection } from "../screens/earns-screen"
import { SectionCompleted } from "../screens/earns-screen/section-completed"
import { GetStartedScreen } from "../screens/get-started-screen"
import { MapScreen } from "../screens/map-screen/map-screen"
import { MoveMoneyScreenDataInjected } from "../screens/move-money-screen"
import {
  WelcomePhoneInputScreen,
  WelcomePhoneValidationScreenDataInjected,
} from "../screens/phone-auth-screen"
import { PriceScreen } from "../screens/price-screen/price-screen"

import { ScanningQRCodeScreen } from "../screens/send-bitcoin-screen"
import { SettingsScreen, UsernameScreen } from "../screens/settings-screen"
import { LanguageScreen } from "../screens/settings-screen/language-screen"
import { SecurityScreen } from "../screens/settings-screen/security-screen"
import { TransactionDetailScreen } from "../screens/transaction-detail-screen"
import { TransactionHistoryScreenDataInjected } from "../screens/transaction-screen/transaction-screen"
import { WelcomeFirstScreen } from "../screens/welcome-screens"
import { palette } from "../theme/palette"
import { AccountType } from "../utils/enum"
import { addDeviceToken } from "../utils/notifications"
import useToken from "../hooks/use-token"
import { showModalClipboardIfValidPayment } from "../utils/clipboard"
import {
  ContactStackParamList,
  PhoneValidationStackParamList,
  PrimaryStackParamList,
  RootStackParamList,
} from "./stack-param-lists"
import type { NavigatorType } from "../types/jsx"
import ReceiveBitcoinScreen from "@app/screens/receive-bitcoin-screen/receive-bitcoin"
import PushNotification from "react-native-push-notification"
import useMainQuery from "@app/hooks/use-main-query"
import { LnurlScreen } from "@app/screens/settings-screen/lnurl-screen"
import HomeIcon from "@app/assets/icons/home.svg"
import ContactsIcon from "@app/assets/icons/contacts.svg"
import MapIcon from "@app/assets/icons/map.svg"
import LearnIcon from "@app/assets/icons/learn.svg"
import SendBitcoinDestinationScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-destination-screen"
import SendBitcoinDetailsScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-details-screen"
import SendBitcoinConfirmationScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-confirmation-screen"
import SendBitcoinSuccessScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-success-screen"
import {
  ConversionDetailsScreen,
  ConversionSuccessScreen,
  ConversionConfirmationScreen,
} from "@app/screens/conversion-flow"
import { translate, setLocale } from "../utils/translate"
import { useAuthenticationContext } from "@app/store/authentication-context"

// Must be outside of any component LifeCycle (such as `componentDidMount`).
PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister(token) {
    console.debug("TOKEN:", token)
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification(notification) {
    console.debug("NOTIFICATION:", notification)

    // process the notification

    // (required) Called when a remote is received or opened, or local notification is opened
    notification.finish(PushNotificationIOS.FetchResult.NoData)
  },

  // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  onAction(notification) {
    console.debug("ACTION:", notification.action)
    console.debug("NOTIFICATION:", notification)

    // process the action
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError(err) {
    console.error(`onRegistration error: ${err.message}`, err)
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: false,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */
  requestPermissions: false,
})

const styles = EStyleSheet.create({
  bottomNavigatorStyle: {
    height: "10%",
  },
})

const RootNavigator = createStackNavigator<RootStackParamList>()

export const RootStack: NavigatorType = () => {
  const appState = React.useRef(AppState.currentState)
  const client = useApolloClient()
  const { token, hasToken, tokenNetwork } = useToken()
  const { userPreferredLanguage, myPubKey, username } = useMainQuery()
  const { isAppLocked } = useAuthenticationContext()
  const _handleAppStateChange = useCallback(
    async (nextAppState) => {
      if (appState.current.match(/background/) && nextAppState === "active") {
        console.info("App has come to the foreground!")
        if (hasToken && !isAppLocked) {
          showModalClipboardIfValidPayment({
            client,
            network: tokenNetwork,
            myPubKey,
            username,
          })
        }
      }

      appState.current = nextAppState
    },
    [client, hasToken, tokenNetwork, myPubKey, username, isAppLocked],
  )

  useEffect(() => {
    const subscription = AppState.addEventListener("change", _handleAppStateChange)
    return () => subscription.remove()
  }, [_handleAppStateChange])

  const showNotification = (remoteMessage) => {
    const soundName = undefined
    PushNotification.localNotification({
      /* Android Only Properties */
      ticker: "My Notification Ticker", // (optional)
      autoCancel: true, // (optional) default: true
      largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
      smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
      // bigText: 'My big text that will be shown when notification is expanded', // (optional) default: "message" prop
      // subText: 'This is a subText', // (optional) default: none
      // color: 'red', // (optional) default: system default
      vibrate: true, // (optional) default: true
      vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
      tag: "some_tag", // (optional) add tag to message
      group: "group", // (optional) add group to message
      ongoing: false, // (optional) set whether this is an "ongoing" notification
      // actions: ['Yes', 'No'], // (Android only) See the doc for notification actions to know more
      // invokeApp: true, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

      /* iOS only properties */
      // alertAction: "view", // (optional) default: view
      category: "", // (optional) default: empty string

      /* iOS and Android properties */
      // id: this.lastId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
      title: remoteMessage.notification.title, // (optional)
      message: remoteMessage.notification.body, // (required)
      userInfo: { screen: "home" }, // (optional) default: {} (using null throws a JSON value '<null>' error)
      playSound: Boolean(soundName), // (optional) default: true
      soundName: soundName || "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
      // number: 18, // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero) --> badge
    })
  }

  const fallback = RNLocalize.getLocales()?.[0]?.languageCode ?? "es-SV"

  setLocale(
    !userPreferredLanguage || userPreferredLanguage === "DEFAULT"
      ? fallback
      : userPreferredLanguage,
  )

  // TODO: need to add isHeadless?
  // https://rnfirebase.io/messaging/usage

  // TODO: check whether react-native-push-notification can give a FCM token
  // for iOS, which would remove the need for firebase.messaging() dependancy
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.debug("onMessage")
      showNotification(remoteMessage)
    })

    return unsubscribe
  }, [])

  // useEffect(() => {
  // const isDeviceRegisteredForRemoteMessages = messaging().isDeviceRegisteredForRemoteMessages
  // Alert.alert(`isDeviceRegisteredForRemoteMessages: ${isDeviceRegisteredForRemoteMessages ? true:false}`)
  // const isAutoInitEnabled = messaging().isAutoInitEnabled
  // Alert.alert(`isAutoInitEnabled: ${isAutoInitEnabled ? true:false}`) // true
  // }, []);

  useEffect(() => {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.debug("background arrived from setBackgroundMessageHandler")
      showNotification(remoteMessage)
    })
  }, [])

  useEffect(() => {
    // onNotificationOpenedApp: When the application is running, but in the background.
    messaging().onNotificationOpenedApp((_remoteMessage) => {
      // console.log(
      //   'Notification caused app to open from background state:',
      //   remoteMessage.notification,
      // );
      // navigation.navigate(remoteMessage.data.type);
    })

    // getInitialNotification: When the application is opened from a quit state.
    messaging()
      .getInitialNotification()
      .then((_remoteMessage) => {
        // if (remoteMessage) {
        //   console.log(
        //     'Notification caused app to open from quit state:',
        //     remoteMessage.notification,
        //   );
        //   setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
        // }
        // setLoading(false);
      })
  }, [])

  useEffect(
    () => messaging().onTokenRefresh(() => token && addDeviceToken(client)),
    [client, token],
  )

  return (
    <RootNavigator.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerBackTitle: translate("common.back"),
      }}
      initialRouteName={token ? "authenticationCheck" : "getStarted"}
    >
      <RootNavigator.Screen
        name="getStarted"
        component={GetStartedScreen}
        options={{
          headerShown: false,
          animationEnabled: false,
        }}
      />
      <RootNavigator.Screen
        name="welcomeFirst"
        component={WelcomeFirstScreen}
        options={{ headerShown: false }}
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
          title: translate("PrimaryScreen.title"),
        }}
      />
      <RootNavigator.Screen
        name="scanningQRCode"
        component={ScanningQRCodeScreen}
        options={{
          title: translate("ScanningQRCodeScreen.title"),
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <RootNavigator.Screen
        name="sendBitcoinDestination"
        component={SendBitcoinDestinationScreen}
        options={{ title: translate("SendBitcoinScreen.title") }}
      />
      <RootNavigator.Screen
        name="sendBitcoinDetails"
        component={SendBitcoinDetailsScreen}
        options={{ title: translate("SendBitcoinScreen.title") }}
      />
      <RootNavigator.Screen
        name="sendBitcoinConfirmation"
        component={SendBitcoinConfirmationScreen}
        options={{ title: translate("SendBitcoinScreen.title") }}
      />
      <RootNavigator.Screen
        name="sendBitcoinSuccess"
        component={SendBitcoinSuccessScreen}
        options={{ title: translate("SendBitcoinScreen.title") }}
      />
      <RootNavigator.Screen
        name="receiveBitcoin"
        component={ReceiveBitcoinScreen}
        options={{
          title: translate("ReceiveBitcoinScreen.title"),
        }}
      />
      <RootNavigator.Screen
        name="conversionDetails"
        component={ConversionDetailsScreen}
        options={{
          title: translate("ConversionDetailsScreen.title"),
        }}
      />
      <RootNavigator.Screen
        name="conversionConfirmation"
        component={ConversionConfirmationScreen}
        options={{
          title: translate("ConversionConfirmationScreen.title"),
        }}
      />
      <RootNavigator.Screen
        name="conversionSuccess"
        component={ConversionSuccessScreen}
        options={{
          headerShown: false,
          title: translate("ConversionSuccess.title"),
        }}
      />
      <RootNavigator.Screen
        name="earnsSection"
        component={EarnSection}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          headerStyle: { backgroundColor: palette.blue },
          headerTintColor: palette.white,
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
          title: translate("SettingsScreen.title"),
        })}
      />
      <RootNavigator.Screen
        name="setUsername"
        component={UsernameScreen}
        options={() => ({
          title: "",
        })}
      />
      <RootNavigator.Screen
        name="language"
        component={LanguageScreen}
        options={{ title: translate("common.languagePreference") }}
      />
      <RootNavigator.Screen
        name="security"
        component={SecurityScreen}
        options={{ title: translate("common.security") }}
      />
      <RootNavigator.Screen
        name="lnurl"
        component={LnurlScreen}
        options={{ title: "Lnurl" }}
      />
      <RootNavigator.Screen name="Profile" component={DebugScreen} />
      <RootNavigator.Screen
        name="sectionCompleted"
        component={SectionCompleted}
        options={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      <RootNavigator.Screen
        name="phoneValidation"
        component={PhoneValidationNavigator}
        options={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
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
        component={TransactionHistoryScreenDataInjected}
        options={{ title: translate("TransactionScreen.transactionHistoryTitle") }}
      />
      <RootNavigator.Screen
        name="priceDetail"
        component={PriceScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          title: translate("common.bitcoinPrice"),
        }}
        initialParams={{ account: AccountType.Bitcoin }}
      />
    </RootNavigator.Navigator>
  )
}

const StackContacts = createStackNavigator<ContactStackParamList>()

export const ContactNavigator: NavigatorType = () => (
  <StackContacts.Navigator>
    <StackContacts.Screen
      name="Contacts"
      component={ContactsScreen}
      options={{
        title: translate("ContactsScreen.title"),
        headerShown: false,
      }}
    />
    <StackContacts.Screen
      name="contactDetail"
      component={ContactsDetailScreen}
      options={{ headerShown: false, title: "test" }}
    />
  </StackContacts.Navigator>
)

const StackPhoneValidation = createStackNavigator<PhoneValidationStackParamList>()

export const PhoneValidationNavigator: NavigatorType = () => (
  <StackPhoneValidation.Navigator>
    <StackPhoneValidation.Screen
      name="welcomePhoneInput"
      options={{
        headerShown: false,
        title: translate("common.phoneNumber"),
      }}
      component={WelcomePhoneInputScreen}
    />
    <StackPhoneValidation.Screen
      name="welcomePhoneValidation"
      component={WelcomePhoneValidationScreenDataInjected}
      options={{
        title: "",
      }}
    />
  </StackPhoneValidation.Navigator>
)

const Tab = createBottomTabNavigator<PrimaryStackParamList>()

type TabProps = {
  color: string
}

export const PrimaryNavigator: NavigatorType = () => {
  const { tokenNetwork } = useToken()

  // The cacheId is updated after every mutation that affects current user data (balanace, contacts, ...)
  // It's used to re-mount this component and thus reset what's cached in Apollo (and React)

  React.useEffect(() => {
    if (tokenNetwork) {
      analytics().setUserProperties({ network: tokenNetwork })
    }
  }, [tokenNetwork])

  return (
    <Tab.Navigator
      initialRouteName="MoveMoney"
      screenOptions={{
        tabBarActiveTintColor:
          tokenNetwork === "mainnet" ? palette.galoyBlue : palette.orange,
        tabBarInactiveTintColor: palette.coolGrey,
        tabBarStyle: styles.bottomNavigatorStyle,
        tabBarLabelStyle: { paddingBottom: 6 },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="MoveMoney"
        component={MoveMoneyScreenDataInjected}
        options={{
          title: translate("MoveMoneyScreen.title"),
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
          title: translate("ContactsScreen.title"),
          tabBarIcon: ({ color }: TabProps) => (
            <ContactsIcon fill="currentColor" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: translate("MapScreen.title"),
          headerShown: false,
          tabBarIcon: ({ color }: TabProps) => <MapIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Earn"
        component={EarnMapDataInjected}
        options={{
          title: translate("EarnScreen.title"),
          headerShown: false,
          tabBarIcon: ({ color }: TabProps) => (
            <LearnIcon fill="currentColor" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
