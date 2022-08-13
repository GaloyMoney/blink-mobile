/* eslint-disable react/display-name */
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"
import "node-libs-react-native/globals" // needed for Buffer?
import * as React from "react"

import { translateUnknown as translate } from "@galoymoney/client"

import type { NavigatorType } from "../types/jsx"

import { CreatePostScreen } from "@app/screens/create-post/create-post-screen"
import { MarketPlaceParamList } from "./stack-param-lists"
import { AddImageScreen } from "@app/screens/create-post/add-images-screen"
import { AddLocationScreen } from "@app/screens/create-post/location-screen"
import { MarketPlace } from "@app/screens/market-place-screen/market-place-screen"
import { MapScreen } from "@app/screens/full-view-map-screen/map-screen"
import { AddContactScreen } from "@app/screens/create-post/add-contact-screen"
import { StoreDetailScreen } from "@app/screens/store-detail-screen"
import { StoreListScreen } from "@app/screens/store-list-screen"

const MarketPlaceStack = createStackNavigator<MarketPlaceParamList>()

export const MarketPlaceStacks: NavigatorType = () => {
  return (
    <MarketPlaceStack.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerBackTitle: translate("common.back"),
        headerShown: false,
      }}
      initialRouteName={"MarketPlace"}
    >
      <MarketPlaceStack.Screen name="MarketPlace" component={MarketPlace} />
      <MarketPlaceStack.Screen name="CreatePost" component={CreatePostScreen} />
      <MarketPlaceStack.Screen name="AddImage" component={AddImageScreen} />
      <MarketPlaceStack.Screen name="AddLocation" component={AddLocationScreen} />
      <MarketPlaceStack.Screen name="MapScreen" component={MapScreen} />
      <MarketPlaceStack.Screen name="AddContact" component={AddContactScreen} />
      <MarketPlaceStack.Screen
        name="ConfirmInformation"
        component={StoreDetailScreen}
      />
    </MarketPlaceStack.Navigator>
  )
}
