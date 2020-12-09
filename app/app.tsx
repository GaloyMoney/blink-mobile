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
import { RootStore, StoreContext } from "./models"
import { Environment } from "./models/environment"
import { RootStack } from "./navigation/root-navigator"
import { getGraphQlUri, Token } from "./utils/token"
import i18n from "i18n-js"
import * as RNLocalize from "react-native-localize"


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

  const defaultStoreInstance = {
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
  }

  useEffect(() => {
    const fn = async () => {
      const token = new Token()
      await token.load()

      const store = RootStore.create(defaultStoreInstance, {
        gqlHttpClient: createHttpClient(await getGraphQlUri(), {
          headers: {
            authorization: token.bearerString,
          },
        }),
      })

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
