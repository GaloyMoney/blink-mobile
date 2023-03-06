import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { createClient } from "graphql-ws"

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  NormalizedCacheObject,
  ServerError,
  split,
} from "@apollo/client"
import AsyncStorage from "@react-native-async-storage/async-storage"
import DeviceInfo from "react-native-device-info"

import { setContext } from "@apollo/client/link/context"
import { RetryLink } from "@apollo/client/link/retry"
import { getMainDefinition } from "@apollo/client/utilities"

import { createPersistedQueryLink } from "@apollo/client/link/persisted-queries"
import { BUILD_VERSION } from "@app/config"
import { useAppConfig } from "@app/hooks"
import { AsyncStorageWrapper, CachePersistor } from "apollo3-cache-persist"
import jsSha256 from "js-sha256"
import React, { PropsWithChildren, useEffect, useState } from "react"
import { createCache } from "./cache"

import { useI18nContext } from "@app/i18n/i18n-react"
import { isIos } from "../utils/helper"
import { loadString, saveString } from "../utils/storage"
import { AnalyticsContainer } from "./analytics"
import { useLanguageQuery, useRealtimePriceQuery } from "./generated"
import { IsAuthedContextProvider, useIsAuthed } from "./is-authed-context"

import { onError } from "@apollo/client/link/error"

import { getLanguageFromString, getLocaleFromLanguage } from "@app/utils/locale-detector"
import { NetworkErrorToast } from "./network-error-toast"
import { MessagingContainer } from "./messaging"

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

  // no need to retry to upload the token
  // specially as it's running on app start
  // and can create some unwanted loop when token is not valid
  "deviceNotificationTokenCreate",
]

const getAuthorizationHeader = (token: string): string => {
  return `Bearer ${token}`
}

const GaloyClient: React.FC<PropsWithChildren> = ({ children }) => {
  const { appConfig, saveToken } = useAppConfig()
  const [networkError, setNetworkError] = useState<ServerError>()

  const [apolloClient, setApolloClient] = useState<{
    client: ApolloClient<NormalizedCacheObject>
    isAuthed: boolean
  }>()

  useEffect(() => {
    ;(async () => {
      const token = appConfig.token

      console.log(
        `creating new apollo client, token: ${Boolean(token)}, uri: ${
          appConfig.galoyInstance.graphqlUri
        }`,
      )

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
      const persistedQueryLink = createPersistedQueryLink({ sha256 })

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

      const authLink = setContext((request, { headers }) => ({
        headers: {
          ...headers,
          authorization: token ? getAuthorizationHeader(token) : "",
        },
      }))

      const retryLink = new RetryLink({
        attempts: {
          max: 5,
          retryIf: (error, operation) => {
            console.debug(JSON.stringify(error), "retry on error")
            return Boolean(error) && !noRetryOperations.includes(operation.operationName)
          },
        },
      })

      const wsLink = new GraphQLWsLink(
        createClient({
          url: appConfig.galoyInstance.graphqlWsUri,
          connectionParams: token
            ? { Authorization: getAuthorizationHeader(token) }
            : undefined,
          retryAttempts: 12,
          shouldRetry: (errOrCloseEvent) => {
            console.warn(
              { errOrCloseEvent },
              "entering shouldRetry function for websocket",
            )
            // TODO: understand how the backend is closing the connection
            // for instance during a new version rollout or k8s upgrade
            //
            // in the meantime:
            // returning true instead of the default 'Any non-`CloseEvent`'
            // to force createClient to attempt a reconnection
            return true
          },
          // Voluntary not using: webSocketImpl: WebSocket
          // seems react native already have an implement of the websocket?
          //
          // TODO: implement keepAlive and reconnection?
          // https://github.com/enisdenjo/graphql-ws/blob/master/docs/interfaces/client.ClientOptions.md#keepalive
        }),
      )

      const errorLink = onError(({ graphQLErrors, networkError }) => {
        // graphqlErrors should be managed locally
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path }) => {
            if (message === "PersistedQueryNotFound") {
              console.log(`[GraphQL info]: Message: ${message}, Path: ${path}}`, {
                locations,
              })
            } else {
              console.warn(`[GraphQL error]: Message: ${message}, Path: ${path}}`, {
                locations,
              })
            }
          })
        // only network error are managed globally
        if (networkError) {
          console.log(`[Network error]: ${networkError}`)
          setNetworkError(networkError as ServerError)
        }
      })

      const link = split(
        ({ query }) => {
          const definition = getMainDefinition(query)
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          )
        },
        wsLink,
        ApolloLink.from([
          retryLink,
          authLink,
          updateTokenLink,
          persistedQueryLink,
          errorLink,
          httpLink,
        ]),
      )

      const cache = createCache()

      const persistor = new CachePersistor({
        cache,
        storage: new AsyncStorageWrapper(AsyncStorage),
        debug: __DEV__,

        persistenceMapper: async (_data) => {
          // TODO:
          // we should only store the last 20 transactions to keep the cache small
          // there could be other data to filter as well
          // filter your cached data and queries
          // return filteredData
          return _data
        },
      })

      const readableVersion = DeviceInfo.getReadableVersion()

      const client = new ApolloClient({
        cache,
        link,
        name: isIos ? "iOS" : "Android",
        version: readableVersion,
        connectToDevTools: true,
      })

      const buildVersion = DeviceInfo.getBuildNumber()

      // Read the current version from AsyncStorage.
      const currentVersion = await loadString(BUILD_VERSION)

      if (currentVersion === buildVersion) {
        // If the current version matches the latest version,
        // we're good to go and can restore the cache.
        await persistor.restore()
      } else {
        // Otherwise, we'll want to purge the outdated persisted cache
        // and mark ourselves as having updated to the latest version.

        // init the DB. will be override if a cache exists
        await persistor.purge()
        await saveString(BUILD_VERSION, buildVersion)
      }

      client.onClearStore(persistor.purge)

      setApolloClient({ client, isAuthed: Boolean(token) })

      return () => client.cache.reset()
    })()
  }, [appConfig.token, appConfig.galoyInstance, saveToken])

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  //
  // This step should be completely covered over by the splash screen though.
  //
  // You're welcome to swap in your own component to render if your boot up
  // sequence is too slow though.
  if (!apolloClient) {
    return <></>
  }

  return (
    <ApolloProvider client={apolloClient.client}>
      <IsAuthedContextProvider value={apolloClient.isAuthed}>
        <MessagingContainer />
        <NetworkErrorToast networkError={networkError} />
        <LanguageSync />
        <AnalyticsContainer />
        <MyPriceUpdates />
        {children}
      </IsAuthedContextProvider>
    </ApolloProvider>
  )
}

const MyPriceUpdates = () => {
  const isAuthed = useIsAuthed()

  const pollInterval = 5 * 60 * 1000 // 5 min
  useRealtimePriceQuery({
    // only fetch after pollInterval
    // the first query is done by the home page automatically
    fetchPolicy: "cache-only",
    nextFetchPolicy: "network-only",
    pollInterval,
    skip: !isAuthed,
  })

  return null
}

const LanguageSync = () => {
  const isAuthed = useIsAuthed()

  const { data } = useLanguageQuery({ fetchPolicy: "cache-first", skip: !isAuthed })

  const userPreferredLocale = getLocaleFromLanguage(
    getLanguageFromString(data?.me?.language),
  )
  const { locale, setLocale } = useI18nContext()

  useEffect(() => {
    if (userPreferredLocale !== locale) {
      setLocale(userPreferredLocale)
    }
    // setLocale is not set as a dependency because it changes every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPreferredLocale, locale])

  return <></>
}

export { GaloyClient }
