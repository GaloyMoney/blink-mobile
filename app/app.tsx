/* eslint-disable camelcase */
// Welcome to the main entry point of the app.
//
// In this file, we'll be kicking off our app or storybook.
import "intl-pluralrules"
import "react-native-reanimated"
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  NormalizedCacheObject,
  split,
} from "@apollo/client"
import { WebSocketLink } from "@apollo/client/link/ws"
import { getMainDefinition } from "@apollo/client/utilities"
import { setContext } from "@apollo/client/link/context"
import { RetryLink } from "@apollo/client/link/retry"
import AsyncStorage from "@react-native-async-storage/async-storage"
import analytics from "@react-native-firebase/analytics"
import "@react-native-firebase/crashlytics"
import {
  NavigationContainer,
  NavigationState,
  PartialState,
} from "@react-navigation/native"
import { AsyncStorageWrapper, CachePersistor } from "apollo3-cache-persist"
import "node-libs-react-native/globals" // needed for Buffer?
import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { createNetworkStatusNotifier } from "react-apollo-network-status"
import { Dimensions, Linking, LogBox } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { RootSiblingParent } from "react-native-root-siblings"
import VersionNumber from "react-native-version-number"
import { GlobalErrorToast } from "./components/global-error"
import { cache } from "./graphql/cache"
import { initQuery, INITWALLET } from "./graphql/init"
import "./utils/polyfill"
import { RootStack } from "./navigation/root-navigator"
import { isIos } from "./utils/helper"
import { saveString, loadString } from "./utils/storage"
import useToken, { getAuthorizationHeader } from "./hooks/use-token"
import ErrorBoundary from "react-native-error-boundary"
import { ErrorScreen } from "./screens/error-screen"
import Toast from "react-native-toast-message"
// import moment locale files so we can display dates in the user's language
import "moment/locale/es"
import "moment/locale/fr-ca"
import "moment/locale/pt-br"
import { PriceContextProvider } from "./store/price-context"
import { AuthenticationContext } from "./store/authentication-context"
import { LocalizationContextProvider } from "./store/localization-context"
import { loadAllLocales } from "./i18n/i18n-util.sync"
import TypesafeI18n from "./i18n/i18n-react"
import { customLocaleDetector } from "./utils/locale-detector"
import { useAppConfig } from "./hooks"
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

const noRetryOperations = [
  "intraLedgerPaymentSend",

  "lnInvoiceFeeProbe",
  "lnInvoicePaymentSend",
  "lnNoAmountInvoiceFeeProbe",
  "lnNoAmountInvoicePaymentSend",
  "lnNoAmountUsdInvoiceFeeProbe",
  "lnUsdInvoiceFeeProbe",

  "onChainPaymentSend",
  "onChainTxFee",
]

loadAllLocales()

/**
 * This is the root component of our app.
 */
export const App = (): JSX.Element => {
  const { token, hasToken, saveToken } = useToken()
  const { appConfig } = useAppConfig()
  const routeName = useRef("Initial")
  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject>>()
  const [persistor, setPersistor] = useState<CachePersistor<NormalizedCacheObject>>()
  const [isAppLocked, setIsAppLocked] = useState(true)
  const processLink = useRef(null)
  const setAppUnlocked = useMemo(
    () => () => {
      setIsAppLocked(false)
      Linking.getInitialURL().then((url) => {
        if (url && hasToken && processLink.current) {
          processLink.current(url)
        }
      })
    },
    [hasToken],
  )

  const setAppLocked = useMemo(() => () => setIsAppLocked(true), [])
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
      const httpLink = new HttpLink({
        uri: appConfig.galoyInstance.graphqlUri,
      })

      // TODO: used to migrate from jwt to kratos token, remove after a few releases
      const updateTokenLink = new ApolloLink((operation, forward) => {
        return forward(operation).map((response) => {
          const context = operation.getContext()

          const kratosToken = context.response.headers.get("kratos-session-token")

          if (kratosToken) {
            saveToken(kratosToken)
          }

          return response
        })
      })

      const wsLink = new WebSocketLink({
        uri: appConfig.galoyInstance.graphqlWsUri,
        options: {
          reconnect: true,
          reconnectionAttempts: 3,
          connectionParams: {
            authorization: hasToken ? getAuthorizationHeader(token) : "",
          },
        },
      })

      const splitLink = split(
        ({ query }) => {
          const definition = getMainDefinition(query)
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          )
        },
        wsLink,
        updateTokenLink.concat(httpLink),
      )

      const authLink = setContext((request, { headers }) => {
        return {
          headers: {
            ...headers,
            authorization: hasToken ? getAuthorizationHeader(token) : "",
          },
        }
      })

      const retryLink = new RetryLink({
        delay: {
          initial: 500, // default = 300
          // max: Infinity,
          // jitter: true
        },
        attempts: {
          max: 3,
          retryIf: (error, operation) => {
            console.debug(JSON.stringify(error), "retry error test")
            return Boolean(error) && !noRetryOperations.includes(operation.operationName)
          },
        },
      })

      const persistor_ = new CachePersistor({
        cache,
        storage: new AsyncStorageWrapper(AsyncStorage),
        debug: __DEV__,
      })

      setPersistor(persistor_)

      const client = new ApolloClient({
        cache,
        link: linkNetworkStatusNotifier.concat(
          retryLink.concat(authLink.concat(splitLink)),
        ),
        name: isIos ? "iOS" : "Android",
        version: `${VersionNumber.appVersion}-${VersionNumber.buildVersion}`,
      })

      const initDb = async () => {
        client.writeQuery({
          query: INITWALLET,
          data: initQuery,
        })
      }

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

        // init the DB. will be override if a cache exists
        await persistor_.purge()
        await initDb()
        await saveString(BUILD_VERSION, buildVersion)
      }

      client.onClearStore(initDb)

      setApolloClient(client)
    }
    fn()
  }, [appConfig.galoyInstance, token, hasToken])

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

  const linking = {
    prefixes: [
      "https://ln.bitcoinbeach.com",
      "bitcoinbeach://",
      "https://pay.mainnet.galoy.io",
      "https://pay.bbw.sv",
    ],
    config: {
      screens: {
        sendBitcoinDestination: ":username",
        moveMoney: "/",
      },
    },
    getInitialURL: async () => {
      const url = await Linking.getInitialURL()
      if (Boolean(url) && hasToken && !isAppLocked) {
        return url
      }
      return null
    },
    subscribe: (listener) => {
      const onReceiveURL = ({ url }: { url: string }) => listener(url)
      // Listen to incoming links from deep linking
      const subscription = Linking.addEventListener("url", onReceiveURL)
      processLink.current = listener

      return () => {
        // Clean up the event listeners
        subscription.remove()
        processLink.current = null
      }
    },
  }

  return (
    <AuthenticationContext.Provider value={{ isAppLocked, setAppUnlocked, setAppLocked }}>
      <ApolloProvider client={apolloClient}>
        <PriceContextProvider>
          <TypesafeI18n locale={customLocaleDetector()}>
            <LocalizationContextProvider>
              <ErrorBoundary FallbackComponent={ErrorScreen}>
                <NavigationContainer
                  linking={linking}
                  onStateChange={(state) => {
                    const currentRouteName = getActiveRouteName(state)

                    if (routeName.current !== currentRouteName && currentRouteName) {
                      analytics().logScreenView({
                        screen_name: currentRouteName + "Manual",
                        screen_class: currentRouteName + "Manual",
                      })
                      routeName.current = currentRouteName
                    }
                  }}
                >
                  <RootSiblingParent>
                    <GlobalErrorToast />
                    <RootStack />
                    <Toast />
                  </RootSiblingParent>
                </NavigationContainer>
              </ErrorBoundary>
            </LocalizationContextProvider>
          </TypesafeI18n>
        </PriceContextProvider>
      </ApolloProvider>
    </AuthenticationContext.Provider>
  )
}
