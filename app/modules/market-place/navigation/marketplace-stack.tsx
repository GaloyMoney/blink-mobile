/* eslint-disable react/display-name */
import { createStackNavigator } from "@react-navigation/stack"
import "node-libs-react-native/globals" // needed for Buffer?
import * as React from "react"
import type { NavigatorType } from "../../../types/jsx"
import { CreatePostScreen } from "@app/modules/market-place/screens/create-post/create-post-screen"
import { MarketPlaceParamList } from "@app/modules/market-place/navigation/param-list"
import { AddImageScreen } from "@app/modules/market-place/screens/create-post/add-images-screen"
import { AddLocationScreen } from "@app/modules/market-place/screens/create-post/location-screen"
import { MarketPlace } from "@app/modules/market-place/screens/market-place-screen/market-place-screen"
import { MapScreen } from "@app/modules/market-place/screens/full-view-map-screen/map-screen"
import { AddContactScreen } from "@app/modules/market-place/screens/create-post/add-contact-screen"
import { PostDetailScreen } from "@app/modules/market-place/screens/post-detail-screen"
import { useI18nContext } from "@app/i18n/i18n-react"

const MarketPlaceStack = createStackNavigator<MarketPlaceParamList>()

export const MarketPlaceStacks: NavigatorType = () => {
  const { LL: t } = useI18nContext()
  return (
    <MarketPlaceStack.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerBackTitle: t.common.back(),
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
      <MarketPlaceStack.Screen name="ConfirmInformation" component={PostDetailScreen} />
    </MarketPlaceStack.Navigator>
  )
}
