import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { createClient } from "graphql-ws"

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  NormalizedCacheObject,
  gql,
  split,
} from "@apollo/client"
import AsyncStorage from "@react-native-async-storage/async-storage"
import VersionNumber from "react-native-version-number"

import { setContext } from "@apollo/client/link/context"
import { RetryLink } from "@apollo/client/link/retry"
import { getMainDefinition } from "@apollo/client/utilities"

import { createNetworkStatusNotifier } from "react-apollo-network-status"

import { createPersistedQueryLink } from "@apollo/client/link/persisted-queries"
import { BUILD_VERSION } from "@app/config"
import { useAppConfig } from "@app/hooks"
import { AsyncStorageWrapper, CachePersistor } from "apollo3-cache-persist"
import jsSha256 from "js-sha256"
import React, { useEffect, useState } from "react"
import useToken, { getAuthorizationHeader } from "../hooks/use-token"
import { createCache } from "./cache"

import { useI18nContext } from "@app/i18n/i18n-react"
import { getLanguageFromLocale } from "@app/utils/locale-detector"
import { isIos } from "../utils/helper"
import { loadString, saveString } from "../utils/storage"
import { AnalyticsContainer } from "./analytics"
import {
  BtcPriceDocument,
  BtcPriceQuery,
  useLanguageQuery,
  usePriceSubscription,
} from "./generated"

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
  const { LL } = useI18nContext()

  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject>>()

  useEffect(() => {
    ;(async () => {
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
          httpLink,
        ]),
      )

      const cache = createCache()

      const persistor = new CachePersistor({
        cache,
        storage: new AsyncStorageWrapper(AsyncStorage),
        debug: __DEV__,
      })

      const client = new ApolloClient({
        cache,
        link,
        name: isIos ? "iOS" : "Android",
        version: `${VersionNumber.appVersion}-${VersionNumber.buildVersion}`,
        connectToDevTools: true,
      })

      // Read the current version from AsyncStorage.
      const currentVersion = await loadString(BUILD_VERSION)
      const buildVersion = String(VersionNumber.buildVersion)

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

      setApolloClient(client)
    })()
  }, [appConfig.galoyInstance, token, hasToken, saveToken, LL])

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
    <ApolloProvider client={apolloClient}>
      <LanguageSync />
      <AnalyticsContainer />
      <PriceSub />
      {children}
    </ApolloProvider>
  )
}

gql`
  subscription price($input: PriceInput!) {
    price(input: $input) {
      price {
        base
        offset
        currencyUnit
        formattedAmount
      }
      errors {
        message
      }
    }
  }

  query btcPrice {
    btcPrice {
      base
      offset
      currencyUnit
      formattedAmount
    }
  }
`

const PriceSub = () => {
  usePriceSubscription({
    onData: ({ data, client }) => {
      data.data?.price.price &&
        client.writeQuery<BtcPriceQuery>({
          query: BtcPriceDocument,
          data: {
            __typename: "Query",
            btcPrice: data.data?.price.price,
          },
        })
    },
    variables: {
      input: {
        amount: 1,
        amountCurrencyUnit: "BTCSAT",
        priceCurrencyUnit: "USDCENT",
      },
    },
    onError: (error) => console.error(error, "useSubscription PRICE_SUBSCRIPTION"),
    onComplete: () => console.info("onComplete useSubscription PRICE_SUBSCRIPTION"),
  })

  return <></>
}

const LanguageSync = () => {
  const { hasToken } = useToken()
  const { data } = useLanguageQuery({ fetchPolicy: "cache-first", skip: !hasToken })

  const userPreferredLanguage = data?.me?.language
  const { locale, setLocale } = useI18nContext()

  useEffect(() => {
    if (userPreferredLanguage && userPreferredLanguage !== locale) {
      setLocale(getLanguageFromLocale(userPreferredLanguage))
    }
    // setLocale is not set as a dependency because it changes every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPreferredLanguage, locale])

  return <></>
}

export { GaloyClient }
