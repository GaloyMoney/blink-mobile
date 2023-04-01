/* eslint-disable react/display-name */
import { createStackNavigator } from "@react-navigation/stack"
import "node-libs-react-native/globals" // needed for Buffer?
import * as React from "react"
import { CreatePostScreen } from "@app/modules/market-place/screens/create-post/create-post-screen"
import { MarketPlaceParamList } from "@app/modules/market-place/navigation/param-list"
import { AddImageScreen } from "@app/modules/market-place/screens/add-images-screen/add-images-screen"
import { FindLocationScreen } from "@app/modules/market-place/screens/find-location-screen/find-location-screen"
import { MarketPlace } from "@app/modules/market-place/screens/market-place-screen/market-place-screen"
import { MapScreen } from "@app/modules/market-place/screens/full-view-map-screen/FullMapViewScreen"
import { AddContactScreen } from "@app/modules/market-place/screens/add-contact-screen/add-contact-screen"
import { PostDetailScreen } from "@app/modules/market-place/screens/post-detail-screen/PostDetailScreen"
import { useI18nContext } from "@app/i18n/i18n-react"
import { MyPostScreen } from "../screens/my-post"

const MarketPlaceStack = createStackNavigator<MarketPlaceParamList>()
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
import { PostListScreen } from "../screens/post-list-screen"
import { StoreListViewScreen } from "../screens/post-list-screen/list-view-screen"


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

export let client: any = undefined;


export const MarketPlaceStacks = () => {
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

  client = new ApolloClient({
    link: from([authLink, httpLink]),
    cache,
    defaultOptions,
  })

  const { LL: t } = useI18nContext()

  return (
    <MarketPlaceStack.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerBackTitle: t.common.back(),
        headerShown: false,
      }}
      initialRouteName={"StoreList"}
    >
      <MarketPlaceStack.Screen name="MarketPlace" component={MarketPlace} />
      <MarketPlaceStack.Screen name="CreatePost" component={CreatePostScreen} />
      <MarketPlaceStack.Screen name="AddImage" component={AddImageScreen} />
      <MarketPlaceStack.Screen name="AddLocation" component={FindLocationScreen} />
      <MarketPlaceStack.Screen name="MapScreen" component={MapScreen} />
      <MarketPlaceStack.Screen name="AddContact" component={AddContactScreen} />
      <MarketPlaceStack.Screen name="ConfirmInformation" component={PostDetailScreen} />
      <MarketPlaceStack.Screen name="MyPost" component={MyPostScreen} />
      <MarketPlaceStack.Screen
        name="StoreList"
        component={PostListScreen}
        options={{
          headerShown: false,
        }}
      />

      <MarketPlaceStack.Screen
        name="StoreListView"
        component={StoreListViewScreen}
        options={{
          headerShown: false,
        }}
      />
    </MarketPlaceStack.Navigator>
  )
}
