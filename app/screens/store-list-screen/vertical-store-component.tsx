import { HeaderComponent } from "@app/components/header"
import { Row } from "@app/components/row"
import { color, fontSize, GlobalStyles, spacing, typography } from "@app/theme"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { MarketPlaceParamList } from "../../navigation/stack-param-lists"
import { ScreenType } from "../../types/jsx"
import FilterSvg from "@asset/svgs/filter.svg"
import { eng } from "@app/constants/en"
import MapView, { Marker } from "react-native-maps"
import Geolocation from "@react-native-community/geolocation"
import DirectionSvg from "@asset/svgs/direction-icon.svg"
import FilledDirectionSvg from "@asset/svgs/filled-direction-icon.svg"
import { images } from "@app/assets/images"
import StarRating from "react-native-star-rating"
import LocationSvg from "@asset/svgs/location-marker.svg"
import { PostAttributes } from "@app/redux/reducers/store-reducer"
const { width, height } = Dimensions.get("window")
const ITEM_WIDTH = (width - 20 * 2 - 32) / 2
type Props = {
  product: PostAttributes
  onItemPress: () => void
}

export const VerticalDataComponent: React.FC<Props> = ({ product, onItemPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onItemPress}>
      <Image
        style={{ height: ITEM_WIDTH, width: ITEM_WIDTH }}
        source={images.tempStore}
      />
      <View style={{ padding: 10 }}>
        <Text style={{ fontFamily: typography.bold, fontSize: fontSize.font14 }}>
          $ 200
        </Text>
        <Text
          style={{
            fontFamily: typography.regular,
            fontSize: fontSize.font16,
            lineHeight: 21,
          }}
        >
          {product.name}
        </Text>
        <Text
          style={{
            fontFamily: typography.medium,
            fontSize: fontSize.font13,
            color: "#9499A5",
          }}
          numberOfLines={2}
        >
          {product.description}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    backgroundColor: "#F4F8FD",
    borderRadius: 8,
    ...GlobalStyles.shadow,
  },
})
