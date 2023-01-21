import { createClient } from "graphql-ws"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  NormalizedCacheObject,
  split,
} from "@apollo/client"
import VersionNumber from "react-native-version-number"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { getMainDefinition } from "@apollo/client/utilities"
import { setContext } from "@apollo/client/link/context"
import { RetryLink } from "@apollo/client/link/retry"

import { createNetworkStatusNotifier } from "react-apollo-network-status"
import { createCache } from "./cache"
import useToken, { getAuthorizationHeader } from "../hooks/use-token"
import { PriceContextProvider } from "../store/price-context"
import React, { useEffect, useState } from "react"
import { AsyncStorageWrapper, CachePersistor } from "apollo3-cache-persist"
import { useAppConfig } from "@app/hooks"
import { BUILD_VERSION } from "@app/config"
import { createPersistedQueryLink } from "@apollo/client/link/persisted-queries"
import jsSha256 from "js-sha256"

import { isIos } from "../utils/helper"
import { saveString, loadString } from "../utils/storage"

const noRetryOperations = [
  "intraLedgerPaymentSend",
  "intraLedgerUsdPaymentSend",

  "lnInvoiceFeeProbe",
  "lnInvoicePaymentSend",
  "lnNoAmountInvoiceFeeProbe",
  "lnNoAmountInvoicePaymentSend",
  "lnNoAmountUsdInvoiceFeeProbe",
  "lnUsdInvoiceFeeProbe",
  "lnNoAmountUsdInvoicePaymentSend",

  "onChainPaymentSend",
  "onChainTxFee",
]

export const { link: linkNetworkStatusNotifier, useApolloNetworkStatus } =
  createNetworkStatusNotifier()

const GaloyClient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, hasToken, saveToken } = useToken()
  const { appConfig } = useAppConfig()

  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject>>()
  const [persistor, setPersistor] = useState<CachePersistor<NormalizedCacheObject>>()

  useEffect(() => {
    const fn = async () => {
      const httpLink = new HttpLink({
        uri: appConfig.galoyInstance.graphqlUri,
      })

      // persistedQuery provide client side bandwidth optimization by returning a hash
      // of the uery instead of the whole query
      //
      // use the following line if you want to deactivate in dev
      // const persistedQueryLink = httpLink
      //
      // we are using "js-sha256" because crypto-hash has compatibility issue with react-native
      // from "@apollo/client/link/persisted-queries/types" but not exporterd
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type SHA256Function = (...args: any[]) => string | PromiseLike<string>
      const sha256: SHA256Function = jsSha256 as unknown as SHA256Function
      const persistedQueryLink = createPersistedQueryLink({ sha256 }).concat(httpLink)

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

      const wsLink = new GraphQLWsLink(
        createClient({
          url: appConfig.galoyInstance.graphqlWsUri,
          connectionParams: hasToken ? { Authorization: `Bearer ${token}` } : undefined,
          // Voluntary not using: webSocketImpl: WebSocket
          // seems react native already have an implement of the websocket?
          //
          // TODO: implement keepAlive and reconnection?
          // https://github.com/enisdenjo/graphql-ws/blob/master/docs/interfaces/client.ClientOptions.md#keepalive
        }),
      )

      const splitLink = split(
        ({ query }) => {
          const definition = getMainDefinition(query)
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          )
        },
        wsLink,
        updateTokenLink.concat(persistedQueryLink),
      )

      const authLink = setContext((request, { headers }) => {
        return {
          headers: {
            ...headers,
            authorization: token ? getAuthorizationHeader(token) : "",
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

      const cache = createCache()

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
        connectToDevTools: true,
      })

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
        await saveString(BUILD_VERSION, buildVersion)
      }

      setApolloClient(client)
    }
    fn()
  }, [appConfig.galoyInstance, token, hasToken, saveToken])

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  //
  // This step should be completely covered over by the splash screen though.
  //
  // You're welcome to swap in your own component to render if your boot up
  // sequence is too slow though.
  if (!apolloClient || !persistor) {
    return <></>
  }

  return (
    <ApolloProvider client={apolloClient}>
      <PriceContextProvider>{children}</PriceContextProvider>
    </ApolloProvider>
  )
}

export { GaloyClient }
