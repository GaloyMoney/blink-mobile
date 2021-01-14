// Welcome to the main entry point of the app.
//
// In this file, we'll be kicking off our app or storybook.

import analytics from "@react-native-firebase/analytics"
import "@react-native-firebase/crashlytics"
import { NavigationContainer, NavigationState, PartialState } from "@react-navigation/native"
import { autorun } from "mobx"
import { createHttpClient } from "mst-gql"
import "node-libs-react-native/globals" // needed for Buffer?
import * as React from "react"
import { useEffect, useState } from "react"
import { Dimensions, YellowBox } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { RootSiblingParent } from "react-native-root-siblings"
import "./i18n"
import { RootStore, ROOT_STATE_STORAGE_KEY, StoreContext } from "./models"
import { Environment } from "./models/environment"
import { RootStack } from "./navigation/root-navigator"
import { getGraphQlUri, Token } from "./utils/token"
import i18n from "i18n-js"
import * as RNLocalize from "react-native-localize"
import VersionNumber from "react-native-version-number"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sleep } from "./utils/sleep"


export async function createEnvironment() {
  const env = new Environment()
  await env.setup()
  return env
}

const entireScreenWidth = Dimensions.get("window").width
EStyleSheet.build({
  $rem: entireScreenWidth / 380,
  // $textColor: '#0275d8'
})

/**
 * Ignore some yellowbox warnings. Some of these are for deprecated functions
 * that we haven't gotten around to replacing yet.
 */
YellowBox.ignoreWarnings([
  "componentWillMount is deprecated",
  "componentWillReceiveProps is deprecated",
  "Require cycle:",
])

// FIXME
console.disableYellowBox = true


export const defaultStoreInstance = {
  wallets: {
    USD: {
      id: "USD",
      currency: "USD",
      balance: 0,
      transactions: [],
    },
    BTC: {
      id: "BTC",
      currency: "BTC",
      balance: 0,
      transactions: [],
    },
  },
  buildParameters: {
    "190": {
      id: "190",
      minBuildNumberAndroid: 182,
      minBuildNumberIos: 182,
      lastBuildNumberAndroid: 190,
      lastBuildNumberIos: 190
    }
  },
  "earns":{"walletDownloaded":{"__typename":"Earn","id":"walletDownloaded","value":1,"completed":false},"walletActivated":{"__typename":"Earn","id":"walletActivated","value":1},"whatIsBitcoin":{"__typename":"Earn","id":"whatIsBitcoin","value":1},"sat":{"__typename":"Earn","id":"sat","value":2},"whereBitcoinExist":{"__typename":"Earn","id":"whereBitcoinExist","value":5},"whoControlsBitcoin":{"__typename":"Earn","id":"whoControlsBitcoin","value":5},"copyBitcoin":{"__typename":"Earn","id":"copyBitcoin","value":5},"moneyImportantGovernement":{"__typename":"Earn","id":"moneyImportantGovernement","value":10},"moneyIsImportant":{"__typename":"Earn","id":"moneyIsImportant","value":10},"whyStonesShellGold":{"__typename":"Earn","id":"whyStonesShellGold","value":10},"moneyEvolution":{"__typename":"Earn","id":"moneyEvolution","value":10},"coincidenceOfWants":{"__typename":"Earn","id":"coincidenceOfWants","value":10},"moneySocialAggrement":{"__typename":"Earn","id":"moneySocialAggrement","value":10},"WhatIsFiat":{"__typename":"Earn","id":"WhatIsFiat","value":10},"whyCareAboutFiatMoney":{"__typename":"Earn","id":"whyCareAboutFiatMoney","value":10},"GovernementCanPrintMoney":{"__typename":"Earn","id":"GovernementCanPrintMoney","value":10},"FiatLosesValueOverTime":{"__typename":"Earn","id":"FiatLosesValueOverTime","value":10},"OtherIssues":{"__typename":"Earn","id":"OtherIssues","value":10},"LimitedSupply":{"__typename":"Earn","id":"LimitedSupply","value":20},"Decentralized":{"__typename":"Earn","id":"Decentralized","value":20},"NoCounterfeitMoney":{"__typename":"Earn","id":"NoCounterfeitMoney","value":20},"HighlyDivisible":{"__typename":"Earn","id":"HighlyDivisible","value":20},"securePartOne":{"__typename":"Earn","id":"securePartOne","value":20},"securePartTwo":{"__typename":"Earn","id":"securePartTwo","value":20},"freeMoney":{"__typename":"Earn","id":"freeMoney","value":50},"custody":{"__typename":"Earn","id":"custody","value":100},"digitalKeys":{"__typename":"Earn","id":"digitalKeys","value":100},"backupWallet":{"__typename":"Earn","id":"backupWallet","value":500},"fiatMoney":{"__typename":"Earn","id":"fiatMoney","value":100},"bitcoinUnique":{"__typename":"Earn","id":"bitcoinUnique","value":100},"moneySupply":{"__typename":"Earn","id":"moneySupply","value":100},"newBitcoin":{"__typename":"Earn","id":"newBitcoin","value":100},"creator":{"__typename":"Earn","id":"creator","value":100},"volatility":{"__typename":"Earn","id":"volatility","value":50000},"activateNotifications":{"__typename":"Earn","id":"activateNotifications","value":500},"phoneVerification":{"__typename":"Earn","id":"phoneVerification","value":2000},"firstLnPayment":{"__typename":"Earn","id":"firstLnPayment","value":1000},"transaction":{"__typename":"Earn","id":"transaction","value":500},"paymentProcessing":{"__typename":"Earn","id":"paymentProcessing","value":500},"decentralization":{"__typename":"Earn","id":"decentralization","value":500},"privacy":{"__typename":"Earn","id":"privacy","value":500},"mining":{"__typename":"Earn","id":"mining","value":500},"inviteAFriend":{"__typename":"Earn","id":"inviteAFriend","value":5000},"bankOnboarded":{"__typename":"Earn","id":"bankOnboarded","value":10000},"buyFirstSats":{"__typename":"Earn","id":"buyFirstSats","value":10000},"debitCardActivation":{"__typename":"Earn","id":"debitCardActivation","value":10000},"firstCardSpending":{"__typename":"Earn","id":"firstCardSpending","value":10000},"firstSurvey":{"__typename":"Earn","id":"firstSurvey","value":10000},"activateDirectDeposit":{"__typename":"Earn","id":"activateDirectDeposit","value":10000},"doubleSpend":{"__typename":"Earn","id":"doubleSpend","value":500},"exchangeHack":{"__typename":"Earn","id":"exchangeHack","value":500},"energy":{"__typename":"Earn","id":"energy","value":500},"difficultyAdjustment":{"__typename":"Earn","id":"difficultyAdjustment","value":500},"dollarCostAveraging":{"__typename":"Earn","id":"dollarCostAveraging","value":500},"scalability":{"__typename":"Earn","id":"scalability","value":500},"lightning":{"__typename":"Earn","id":"lightning","value":500},"moneyLaundering":{"__typename":"Earn","id":"moneyLaundering","value":500},"tweet":{"__typename":"Earn","id":"tweet","value":1000}},
}

/**
 * This is the root component of our app.
 */
export const App = () => {
  const [rootStore, setRootStore] = useState(null)
  const [routeName, setRouteName] = useState("Initial")

  const getActiveRouteName = (
    state: NavigationState | PartialState<NavigationState> | undefined,
  ): string => {
    if (!state || typeof state.index !== "number") {
      return "Unknown"
    }

    const route = state.routes[state.index]

    if (route.state) {
      return getActiveRouteName(route.state)
    }

    return route.name
  }

  useEffect(() => {
    const fn = async () => {
      const token = new Token()
      await token.load()

      const getStore = async () => RootStore.create(defaultStoreInstance, {
        gqlHttpClient: createHttpClient(await getGraphQlUri(), {
          headers: {
            authorization: token.bearerString,
          },
        }),
      })

      let store = await getStore()
      
      // FIXME: this is needed for the localStorageMixin to load
      // use a deterministic way to load the store
      await sleep(50)

      // we reset the store if we are upgrading. to avoid crash related to updates.
      if (store.currentAppVersion != String(VersionNumber.buildVersion)) {
        console.tron.log("app has been upgraded")
        try {
          // FIXME: dirty way to reset the store
          AsyncStorage.removeItem(ROOT_STATE_STORAGE_KEY)
          store = await getStore()
          store.updateAppVersion()
        } catch (err) {
          console.tron.log({err})
        }
      }

      setRootStore(store)

      const fallback = { languageTag: "es", isRTL: false }
      const { languageTag } = RNLocalize.findBestAvailableLanguage(Object.keys(i18n.translations)) || fallback
      i18n.locale = store.user.language ? store.user.language : languageTag

      // setRootStore(await setupRootStore())
      const env = await createEnvironment()

      // reactotron logging
      if (__DEV__) {
        env.reactotron.setRootStore(store, {})
      }
    }
    fn()
  }, [])

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  //
  // This step should be completely covered over by the splash screen though.
  //
  // You're welcome to swap in your own component to render if your boot up
  // sequence is too slow though.

  if (!rootStore) {
    return null
  }

  return (
    // TODO replace with React.createContext
    // https://mobx.js.org/refguide/inject.html

    <StoreContext.Provider value={rootStore}>
      <NavigationContainer
        linking={{
          prefixes: ['https://ln.bitcoinbeach.com', 'bitcoinbeach://'],
          config: {
            screens: {
              Primary: {
                  screens: {
                  MoveMoney: {
                    initialRouteName: "moveMoney",
                    screens: rootStore.walletIsActive ? {
                      sendBitcoin: ":username",
                      moveMoney: "/",
                    } : null
          }}}}}}}
        // fallback={<Text>Loading...</Text>}
        onStateChange={(state) => {
          const currentRouteName = getActiveRouteName(state)

          if (routeName !== currentRouteName) {
            analytics().logScreenView({
              screen_name: currentRouteName,
              screen_class: currentRouteName,
            });
            setRouteName(currentRouteName)
          }
        }}
      >
        <RootSiblingParent>
          <RootStack />
        </RootSiblingParent>
      </NavigationContainer>
    </StoreContext.Provider>
  )
}
