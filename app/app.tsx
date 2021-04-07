// Welcome to the main entry point of the app.
//
// In this file, we'll be kicking off our app or storybook.

import { ApolloClient, ApolloProvider, HttpLink } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import analytics from "@react-native-firebase/analytics"
import "@react-native-firebase/crashlytics"
import { NavigationContainer, NavigationState, PartialState } from "@react-navigation/native"
import "node-libs-react-native/globals" // needed for Buffer?
import * as React from "react"
import { useEffect, useState } from "react"
import { createNetworkStatusNotifier } from 'react-apollo-network-status'
import { Dimensions, LogBox } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { RootSiblingParent } from "react-native-root-siblings"
import VersionNumber from "react-native-version-number"
import { GlobalErrorToast } from "./components/global-error"
import { cache } from "./graphql/cache"
import { initQuery, INITWALLET } from "./graphql/init"
import { walletIsActive } from "./graphql/query"
import "./i18n"
import { RootStack } from "./navigation/root-navigator"
import { isIos } from "./utils/helper"
import { getGraphQlUri, Token } from "./utils/token"

export const {link, useApolloNetworkStatus} = createNetworkStatusNotifier();

const entireScreenWidth = Dimensions.get("window").width
EStyleSheet.build({
  $rem: entireScreenWidth / 380,
  // $textColor: '#0275d8'
})

/**
 * Ignore some yellowbox warnings. Some of these are for deprecated functions
 * that we haven't gotten around to replacing yet.
 */
LogBox.ignoreLogs([
  "componentWillMount is deprecated",
  "componentWillReceiveProps is deprecated",
  "Require cycle:",
])

// FIXME
LogBox.ignoreAllLogs()


/**
 * This is the root component of our app.
 */
export const App = () => {
  const [routeName, setRouteName] = useState("Initial")
  const [apolloClient, setApolloClient] = useState(null)

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

      // legacy. when was using mst-gql. storage is deleted as we don't want 
      // to keep this around.
      const LEGACY_ROOT_STATE_STORAGE_KEY = "rootAppGaloy"
      await AsyncStorage.multiRemove([LEGACY_ROOT_STATE_STORAGE_KEY])

      const customFetch = async (_ /* uri not used */, options) => {
        const uri = await getGraphQlUri()
        return fetch(uri, options)
      }

      const httpLink = new HttpLink({ fetch: customFetch })

      const authLink = setContext((_, { headers }) => {
        return {
          headers: {
            ...headers,
            authorization: token.bearerString,
          },
        }
      })

      const client = new ApolloClient({
        cache,
        link: link.concat(authLink.concat(httpLink)),
        name: isIos ? "iOS" : "Android",
        version: `${VersionNumber.appVersion}-${VersionNumber.buildVersion}`,
      })

      const initDb = async () => {
        client.writeQuery({
          query: INITWALLET,
          data: initQuery,
        })
      }

      client.onClearStore(initDb)

      const result = client.readQuery({ query: INITWALLET })

      // init the DB on the first run
      if (!result) {
        await initDb()
      }

      // APOLLO TODO: delete DB across version
      // TODO: move from inMemory cache to file cache

      setApolloClient(client)
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

  if (!apolloClient) {
    return null
  }

  return (
    <ApolloProvider client={apolloClient}>
      <NavigationContainer
        linking={{
          prefixes: ["https://ln.bitcoinbeach.com", "bitcoinbeach://"],
          config: {
            screens: {
              Primary: {
                screens: {
                  MoveMoney: {
                    initialRouteName: "moveMoney",
                    screens: walletIsActive(apolloClient)
                      ? {
                          sendBitcoin: ":username",
                          moveMoney: "/",
                        }
                      : null,
                  },
                },
              },
            },
          },
        }}
        // fallback={<Text>Loading...</Text>}
        onStateChange={(state) => {
          const currentRouteName = getActiveRouteName(state)

          if (routeName !== currentRouteName) {
            analytics().logScreenView({
              screen_name: currentRouteName,
              screen_class: currentRouteName,
            })
            setRouteName(currentRouteName)
          }
        }}
      >
        <RootSiblingParent>
          <GlobalErrorToast />
          <RootStack />
        </RootSiblingParent>
      </NavigationContainer>
    </ApolloProvider>
  )
}
