// Welcome to the main entry point of the app.
//
// In this file, we'll be kicking off our app or storybook.

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  NormalizedCacheObject,
} from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { RetryLink } from "@apollo/client/link/retry"
import AsyncStorage from "@react-native-async-storage/async-storage"
import analytics from "@react-native-firebase/analytics"
// eslint-disable-next-line import/no-unassigned-import
import "@react-native-firebase/crashlytics"
import {
  NavigationContainer,
  NavigationState,
  PartialState,
} from "@react-navigation/native"
import { AsyncStorageWrapper, CachePersistor } from "apollo3-cache-persist"
// eslint-disable-next-line import/no-unassigned-import
import "node-libs-react-native/globals" // needed for Buffer?
import * as React from "react"
import { useEffect, useState } from "react"
import { createNetworkStatusNotifier } from "react-apollo-network-status"
import { Dimensions, LogBox } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { RootSiblingParent } from "react-native-root-siblings"
import VersionNumber from "react-native-version-number"
import { GlobalErrorToast } from "./components/global-error"
import { cache } from "./graphql/cache"
import { initQuery, INITWALLET } from "./graphql/init"
import { walletIsActive } from "./graphql/query"
// eslint-disable-next-line import/no-unassigned-import
import "./i18n"
// eslint-disable-next-line import/no-unassigned-import
import "./utils/polyfill"
import { RootStack } from "./navigation/root-navigator"
import { isIos } from "./utils/helper"
import { getGraphQLUri, getGraphQLV2Uri, Token } from "./utils/token"
import { saveString, loadString } from "./utils/storage"
import { graphqlV2OperationNames } from "./graphql/graphql-v2-operations"

export const BUILD_VERSION = "build_version"

export const { link: linkNetworkStatusNotifier, useApolloNetworkStatus } =
  createNetworkStatusNotifier()

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
export const App = (): JSX.Element => {
  const [routeName, setRouteName] = useState("Initial")
  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject>>()
  const [persistor, setPersistor] = useState<CachePersistor<NormalizedCacheObject>>()

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
      const token = Token.getInstance()
      await token.load()

      // legacy. when was using mst-gql. storage is deleted as we don't want
      // to keep this around.
      const LEGACY_ROOT_STATE_STORAGE_KEY = "rootAppGaloy"
      await AsyncStorage.multiRemove([LEGACY_ROOT_STATE_STORAGE_KEY])

      const customFetch = async (_ /* uri not used */, options) => {
        const uri = await getGraphQLUri()
        return fetch(uri, options)
      }

      const customFetchV2 = async (_ /* uri not used */, options) => {
        const uri = await getGraphQLV2Uri()
        return fetch(uri, options)
      }

      const httpLink = new HttpLink({ fetch: customFetch })
      const httpLinkV2 = new HttpLink({ fetch: customFetchV2 })

      const authLink = setContext((_, { headers }) => ({
        headers: {
          ...headers,
          authorization: token.bearerString,
        },
      }))

      const retryLink = new RetryLink({
        delay: {
          initial: 500, // default = 300
          // max: Infinity,
          // jitter: true
        },
        attempts: {
          max: 3,
          retryIf: (error, operation) => {
            console.log({ error }, "retry error")
            return (
              !!error &&
              !/onchain_pay|payKeysendUsername|payInvoice/.test(operation.operationName)
            )
          },
        },
      }).split(
        (operation) => graphqlV2OperationNames.includes(operation.operationName),
        httpLinkV2,
        httpLink,
      )

      const persistor_ = new CachePersistor({
        cache,
        storage: new AsyncStorageWrapper(AsyncStorage),
        debug: __DEV__,
      })

      setPersistor(persistor_)

      const client = new ApolloClient({
        cache,
        link: linkNetworkStatusNotifier.concat(authLink.concat(retryLink)),
        name: isIos ? "iOS" : "Android",
        version: `${VersionNumber.appVersion}-${VersionNumber.buildVersion}`,
      })

      const initDb = async () => {
        client.writeQuery({
          query: INITWALLET,
          data: initQuery,
        })
      }

      // init the DB. will be override if a cache exists
      await initDb()

      // Read the current schema version from AsyncStorage.
      const currentVersion = await loadString(BUILD_VERSION)
      const buildVersion = String(VersionNumber.buildVersion)

      // TODO: also add a schema version?
      if (currentVersion === buildVersion) {
        // If the current version matches the latest version,
        // we're good to go and can restore the cache.
        await persistor_.restore()
      } else {
        // Otherwise, we'll want to purge the outdated persisted cache
        // and mark ourselves as having updated to the latest version.
        await persistor_.purge()
        await saveString(BUILD_VERSION, buildVersion)
      }

      client.onClearStore(initDb)

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

  if (!apolloClient || !persistor) {
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
