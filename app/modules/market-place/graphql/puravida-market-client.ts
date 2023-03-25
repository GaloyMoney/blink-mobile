/* eslint-disable react/display-name */
import { createStackNavigator } from "@react-navigation/stack"
import "node-libs-react-native/globals" // needed for Buffer?
import { MarketPlaceParamList } from "@app/modules/market-place/navigation/param-list"

import {
  ApolloClient,
  createHttpLink,
  DefaultOptions,
  from,
  InMemoryCache,
} from "@apollo/client"

import { setContext } from "@apollo/client/link/context"
import { useAppConfig } from "@app/hooks"
import { GRAPHQL_MARKET_PLACE_MAINNET_URI, GRAPHQL_MARKET_PLACE_STAGING_URI } from "../config"


export const cache = new InMemoryCache({ addTypename: false })

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
}


export const initPuravidaMarketPlaceClient = () => {
  const { appConfig } = useAppConfig()
  const uri = appConfig.galoyInstance.name === "Staging" ? GRAPHQL_MARKET_PLACE_STAGING_URI : GRAPHQL_MARKET_PLACE_MAINNET_URI
  const httpLink = createHttpLink({ uri })

  const authLink = setContext(async (_, { headers }) => {
    return {
      headers: {
        ...headers,
        "authorization": `Bearer ${appConfig.token}`,
      },
    }
  })

  const client = new ApolloClient({
    link: from([authLink, httpLink]),
    cache,
    defaultOptions,
  })


  return client
}
