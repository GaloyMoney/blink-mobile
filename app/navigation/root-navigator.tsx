import Clipboard from "@react-native-community/clipboard"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"
import * as React from "react"
import { useEffect, useState } from "react"
import { AppState } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { translate } from "../i18n"
import { StoreContext } from "../models"
import { AccountDetailScreen } from "../screens/account-detail-screen/account-detail-screen"
import { DebugScreen } from "../screens/debug-screen"
import { EarnMapDataInjected } from "../screens/earns-map-screen"
import { EarnQuiz, EarnSection } from "../screens/earns-screen"
import { SectionCompleted } from "../screens/earns-screen/section-completed"
import { GetStartedScreen } from "../screens/get-started-screen"
import { FindATMScreen, MoveMoneyScreenDataInjected, ReceiveBitcoinScreen, ScanningQRCodeScreen, SendBitcoinScreen } from "../screens/move-money-screen"
import { WelcomePhoneInputScreen, WelcomePhoneValidationScreenDataInjected } from "../screens/phone-auth-screen"
import { SplashScreen } from "../screens/splash-screen"
import { TransactionDetailScreen } from "../screens/transaction-detail-screen"
import { TransactionScreenDataInjected } from "../screens/transaction-screen/transaction-screen"
import { WelcomeFirstScreen } from "../screens/welcome-screens"
import { palette } from "../theme/palette"
import { AccountType } from "../utils/enum"
import { validPayment } from "../utils/parsing"
import { getNetwork, Token } from "../utils/token"


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


const RootNavigator = createStackNavigator()

export const RootStack = () => {
  const [initialRouteName, setInitialRouteName] = useState("")

  const appState = React.useRef(AppState.currentState);
  const store = React.useContext(StoreContext)

  useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange);
    checkClipboard()

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, []);

  const _handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) && nextAppState === "active"
    ) {
      console.tron.log("App has come to the foreground!");
      checkClipboard()
    }

    appState.current = nextAppState;
  };

  const checkClipboard = async () => {
    const clipboard = await Clipboard.getString()

    if (store.user.level < 1) {
      return
    }

    const {valid} = validPayment(clipboard, new Token().network)
    if (!valid) {
      return
    }
    
    store.setModalClipboardVisible(true)
  }

  useEffect(() => {
    const _ = async () => {
      const token = new Token()

      if (token.has()) {
        setInitialRouteName("Primary")
      } else {
        setInitialRouteName("getStarted")
      }
    }

    _()
  }, [])

  if (initialRouteName === "") {
    return <SplashScreen />
  }

  console.tron.log({initialRouteName})

  return (
    <RootNavigator.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ gestureEnabled: false }}
    >
      <RootNavigator.Screen
        name="getStarted"
        component={GetStartedScreen}
        options={{ headerShown: false }}
      />
      <RootNavigator.Screen name="debug" component={DebugScreen} />
      <RootNavigator.Screen
        name="welcomeFirst"
        component={WelcomeFirstScreen}
        options={{ headerShown: false }}
      />
      <RootNavigator.Screen
        name="Primary"
        component={PrimaryNavigator}
        options={{ headerShown: false }}
      />
      <StackMoveMoney.Screen
        name="scanningQRCode"
        component={ScanningQRCodeScreen}
        options={{
          title: translate("ScanningQRCodeScreen.title"),
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
        }}
      />
      <RootNavigator.Screen
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
      <RootNavigator.Screen
        name="earnsQuiz"
        component={EarnQuiz}
        options={{ 
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      <RootNavigator.Screen
        name="Profile"
        component={DebugScreen}
      />
      <RootNavigator.Screen
        name="sectionCompleted"
        component={SectionCompleted}
        options={{ 
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS
        }}
      />
      <RootNavigator.Screen
        name="phoneValidation"
        component={PhoneValidationNavigator}
        options={{ 
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS
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
        component={TransactionScreenDataInjected}
        options={() => ({
          title: "Transaction History",
        })}
      />
      <RootNavigator.Screen
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
    </RootNavigator.Navigator>
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
        name="receiveBitcoin"
        component={ReceiveBitcoinScreen}
        options={{ title: translate("ReceiveBitcoinScreen.title") }}
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
          title: translate("common.phoneNumber")
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
  const [network, setNetwork] = React.useState("mainnet")

  React.useEffect(() => {
    (async () => {
      setNetwork(await getNetwork())
    })()
  }, [])

  return (
    <Tab.Navigator
      initialRouteName="MoveMoney"
      tabBarOptions={{
        activeTintColor: network === "mainnet" ? 
          palette.lightBlue : palette.orange,
        inactiveTintColor: palette.lightGrey,
        style: styles.bottomNavigatorStyle,
      }}
    >
      <Tab.Screen
        name="Transactions"
        component={TransactionScreenDataInjected}
        options={{
          // title: translate("AccountsScreen.title"),
          tabBarIcon: ({ focused, color }) => {
            return <Icon name={"ios-list-outline"} size={size} color={color} />
          },
        }}
      />
      <Tab.Screen
        name="MoveMoney"
        component={MoveMoneyNavigator}
        options={{
          title: translate("MoveMoneyScreen.title"),
          tabBarIcon: ({ focused, color }) => {
            return <Icon name={"ios-swap-horizontal"} size={size} color={color} />
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
    </Tab.Navigator>
  )
}