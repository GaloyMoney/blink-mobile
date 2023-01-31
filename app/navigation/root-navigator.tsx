import { useApolloClient } from "@apollo/client"
import PushNotificationIOS from "@react-native-community/push-notification-ios"
import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"
import "node-libs-react-native/globals" // needed for Buffer?
import * as React from "react"
import { useCallback, useEffect } from "react"
import { AppState, AppStateStatus } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

import {
  AuthenticationCheckScreen,
  AuthenticationScreen,
} from "../screens/authentication-screen"
import { PinScreen } from "../screens/authentication-screen/pin-screen"
import { ContactsDetailScreen, ContactsScreen } from "../screens/contacts-screen"
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

import ContactsIcon from "@app/assets/icons/contacts.svg"
import HomeIcon from "@app/assets/icons/home.svg"
import LearnIcon from "@app/assets/icons/learn.svg"
import MapIcon from "@app/assets/icons/map.svg"
import { useI18nContext } from "@app/i18n/i18n-react"
import {
  ConversionConfirmationScreen,
  ConversionDetailsScreen,
  ConversionSuccessScreen,
} from "@app/screens/conversion-flow"
import { GaloyAddressScreen } from "@app/screens/galoy-address-screen"
import ReceiveBitcoinScreen from "@app/screens/receive-bitcoin-screen/receive-bitcoin"
import RedeemBitcoinDetailScreen from "@app/screens/redeem-lnurl-withdrawal-screen/redeem-bitcoin-detail-screen"
import RedeemBitcoinResultScreen from "@app/screens/redeem-lnurl-withdrawal-screen/redeem-bitcoin-result-screen"
import SendBitcoinConfirmationScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-confirmation-screen"
import SendBitcoinDestinationScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-destination-screen"
import SendBitcoinDetailsScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-details-screen"
import SendBitcoinSuccessScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-success-screen"
import { AccountScreen } from "@app/screens/settings-screen/account-screen"
import { LnurlScreen } from "@app/screens/settings-screen/lnurl-screen"
import { TransactionLimitsScreen } from "@app/screens/settings-screen/transaction-limits-screen"
import { logEnterBackground, logEnterForeground } from "@app/utils/analytics"
import PushNotification from "react-native-push-notification"
import useToken from "../hooks/use-token"
import { ScanningQRCodeScreen } from "../screens/send-bitcoin-screen"
import { SettingsScreen } from "../screens/settings-screen"
import { LanguageScreen } from "../screens/settings-screen/language-screen"
import { SecurityScreen } from "../screens/settings-screen/security-screen"
import { TransactionDetailScreen } from "../screens/transaction-detail-screen"
import { TransactionHistoryScreenDataInjected } from "../screens/transaction-screen/transaction-screen"
import { palette } from "../theme/palette"
import { AccountType } from "../utils/enum"
import { addDeviceToken, hasNotificationPermission } from "../utils/notifications"
import {
  ContactStackParamList,
  PhoneValidationStackParamList,
  PrimaryStackParamList,
  RootStackParamList,
} from "./stack-param-lists"

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

export const RootStack = () => {
  const appState = React.useRef(AppState.currentState)
  const client = useApolloClient()
  const { token, hasToken } = useToken()

  const _handleAppStateChange = useCallback(async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/background/) && nextAppState === "active") {
      console.info("App has come to the foreground!")
      logEnterForeground()
    }

    if (appState.current.match(/active/) && nextAppState === "background") {
      logEnterBackground()
    }

    appState.current = nextAppState
  }, [])
  const { LL } = useI18nContext()

  useEffect(() => {
    const subscription = AppState.addEventListener("change", _handleAppStateChange)
    return () => subscription.remove()
  }, [_handleAppStateChange])

  const showNotification = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    const soundName = undefined
    if (remoteMessage.notification?.body) {
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
        title: remoteMessage.notification?.title, // (optional)
        message: remoteMessage.notification?.body, // (required)
        userInfo: { screen: "home" }, // (optional) default: {} (using null throws a JSON value '<null>' error)
        playSound: Boolean(soundName), // (optional) default: true
        soundName: soundName || "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        // number: 18, // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero) --> badge
      })
    }
  }

  // TODO: need to add isHeadless?
  // https://rnfirebase.io/messaging/usage

  // TODO: check whether react-native-push-notification can give a FCM token
  // for iOS, which would remove the need for firebase.messaging() dependency
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

  useEffect(() => {
    const setupNotifications = async () => {
      if (hasToken && client) {
        const hasPermission = await hasNotificationPermission()
        if (hasPermission) {
          addDeviceToken(client)
          messaging().onTokenRefresh(() => addDeviceToken(client))
        }
      }
    }
    setupNotifications()
  }, [client, hasToken])

  return (
    <RootNavigator.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerBackTitle: LL.common.back(),
      }}
      initialRouteName={token ? "authenticationCheck" : "getStarted"}
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
        component={ReceiveBitcoinScreen}
        options={{
          title: LL.ReceiveBitcoinScreen.title(),
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
          title: LL.SettingsScreen.title(),
        })}
      />
      <RootNavigator.Screen
        name="addressScreen"
        component={GaloyAddressScreen}
        options={() => ({
          title: "",
          headerStyle: {
            backgroundColor: "#E6EBEF",
          },
        })}
      />
      <RootNavigator.Screen
        name="language"
        component={LanguageScreen}
        options={{ title: LL.common.languagePreference() }}
      />
      <RootNavigator.Screen
        name="security"
        component={SecurityScreen}
        options={{ title: LL.common.security() }}
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
        options={{ title: LL.TransactionScreen.transactionHistoryTitle() }}
      />
      <RootNavigator.Screen
        name="priceDetail"
        component={PriceScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          title: LL.common.bitcoinPrice(),
        }}
        initialParams={{ account: AccountType.Bitcoin }}
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
        options={{ headerShown: false, title: "test" }}
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
        name="welcomePhoneInput"
        options={{
          headerShown: false,
          title: LL.common.phoneNumber(),
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
}

const Tab = createBottomTabNavigator<PrimaryStackParamList>()

type TabProps = {
  color: string
}

export const PrimaryNavigator = () => {
  const { LL } = useI18nContext()
  // The cacheId is updated after every mutation that affects current user data (balanace, contacts, ...)
  // It's used to re-mount this component and thus reset what's cached in Apollo (and React)

  return (
    <Tab.Navigator
      initialRouteName="MoveMoney"
      screenOptions={{
        tabBarActiveTintColor: palette.galoyBlue,
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
          title: LL.MoveMoneyScreen.title(),
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
        component={EarnMapDataInjected}
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
