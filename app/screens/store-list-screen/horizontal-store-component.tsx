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
type Props = {
  product: PostAttributes
  onLocationPress: () => void
  onItemPress: () => void
}

export const LandscapeDataComponent: React.FC<Props> = ({
  product,
  onLocationPress,
  onItemPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onItemPress}>
      <Row containerStyle={{ flex: 1 }}>
        <Image
          style={{ width: 89, height: "100%", borderRadius: 4, marginRight: 10 }}
          source={images.placeholderImage}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.bigText}>{product.name}</Text>
          <Row containerStyle={{ alignItems: "center" }}>
            <FilledDirectionSvg />
            <Text style={styles.smallText}> {product.distance || 0}m</Text>
          </Row>
          <Row containerStyle={{ justifyContent: "space-between", alignItems: "center" }}>
            <StarRating
              disabled
              maxStars={5}
              rating={product.rating || 0}
              emptyStarColor={"#FFC62B"}
              fullStarColor={"#FFC62B"}
              starSize={13}
              containerStyle={{ width: 13 * 5 + 4 * 3, marginVertical: 10 }}
            />
            <Text style={styles.smallText}> {product.reviewNumber} review</Text>
          </Row>
          <Text style={[styles.bigText, { fontSize: fontSize.font14 }]} numberOfLines={2}>
            {product.description}
          </Text>
        </View>
      </Row>
      <Row containerStyle={{ marginTop: 10 }}>
        <TouchableOpacity style={styles.buttonStyle}>
          <DirectionSvg />
          <Text style={styles.buttonText}>Direction</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonStyle} onPress={onLocationPress}>
          <LocationSvg fill={"#3752FE"} />
          <Text style={styles.buttonText}>Location</Text>
        </TouchableOpacity>
      </Row>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  buttonText: {
    marginLeft: 5,
    fontFamily: typography.bold,
    fontSize: fontSize.font8,
    color: "#3752FE",
  },
  container: {
    width: 330,
    padding: 8,
    paddingRight: 16,
    backgroundColor: "white",
    height: 160,
    borderRadius: 10,
  },
  bigText: { fontFamily: typography.medium, fontSize: fontSize.font16 },
  smallText: {
    fontFamily: typography.medium,
    fontSize: fontSize.font12,
    color: color.palette.grey2,
  },
  buttonStyle: {
    backgroundColor: "rgba(55, 82, 254, 0.11)",
    borderRadius: 5,
    paddingVertical: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 13,
    alignItems: "center",
    flexDirection: "row",
    marginRight: 7,
  },
})
