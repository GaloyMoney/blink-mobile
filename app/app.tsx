// Welcome to the main entry point of the app.
//
// In this file, we'll be kicking off our app or storybook.

import analytics from "@react-native-firebase/analytics"
import "@react-native-firebase/crashlytics"

import { NavigationContainer, NavigationState, PartialState } from "@react-navigation/native"
import { createHttpClient } from "mst-gql"
import "node-libs-react-native/globals" // needed for Buffer?
import * as React from "react"
import { useEffect, useState } from "react"
import { Dimensions, YellowBox } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import "./i18n"
import { RootStore, StoreContext } from "./models"
import { Environment } from "./models/environment"
import { RootStack } from "./navigation/root-navigator"
import { getGraphQlUri, Token } from "./utils/token"
import { RootSiblingParent } from "react-native-root-siblings"

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
    users: {
      incognito: {
        id: "incognito",
        level: 0,
      },
    },
  }

  useEffect(() => {
    const fn = async () => {
      const token = new Token()
      await token.load()

      const rs = RootStore.create(defaultStoreInstance, {
        gqlHttpClient: createHttpClient(await getGraphQlUri(), {
          headers: {
            authorization: token.bearerString,
          },
        }),
      })

      setRootStore(rs)

      // setRootStore(await setupRootStore())
      const env = await createEnvironment()

      console.log({ env })
      // reactotron logging
      if (__DEV__) {
        env.reactotron.setRootStore(rs, {})
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
