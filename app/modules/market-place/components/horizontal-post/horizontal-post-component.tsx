import { color, palette } from "@app/theme"
import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import DirectionSvg from "@app/modules/market-place/assets/svgs/direction-icon.svg"
import FilledDirectionSvg from "@app/modules/market-place/assets/svgs/filled-direction-icon.svg"
import { images } from "@app/modules/market-place/assets/images"
import LocationSvg from "@app/modules/market-place/assets/svgs/location-marker.svg"
import { PostAttributes } from "@app/modules/market-place/redux/reducers/store-reducer"
import { Row } from "../row"
import { fontSize, typography } from "../../theme/typography"
import { useI18nContext } from "@app/i18n/i18n-react"
const { width, height } = Dimensions.get("window")
type Props = {
  product: PostAttributes
  onLocationPress: () => void
  onItemPress: () => void
  onDirectionPress: () => void
  isFullWidth?:boolean
  showsStatus?:boolean
}

export const HorizontalPostComponent: React.FC<Props> = ({
  product,
  onLocationPress,
  onDirectionPress,
  onItemPress,
  isFullWidth,
  showsStatus
}) => {

  const { LL: t } = useI18nContext();

  return (
    <TouchableOpacity style={[styles.container, { width: isFullWidth ? width - 40 : 330 }]} onPress={onItemPress}>
      <Row containerStyle={{ flex: 1 }}>
        <Image
          style={{ width: 89, height: "100%", borderRadius: 4, marginRight: 10 }}
          source={
            product?.mainImageUrl
              ? { uri: product.mainImageUrl }
              : images.placeholderImage
          }
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.bigText}>{product.name}</Text>
          <Row containerStyle={{ alignItems: "center" }}>
            <FilledDirectionSvg />
            <Text style={styles.smallText}> {showsStatus?product.status:`${0}m`}</Text>
          </Row>
          <Text style={[styles.bigText, { fontSize: fontSize.font14 }]} numberOfLines={2}>
            {product.description}
          </Text>
          <Row containerStyle={{ marginTop: 10 }}>
            <TouchableOpacity style={styles.buttonStyle} onPress={onDirectionPress}>
              <DirectionSvg />
              <Text style={styles.buttonText}>{t.marketPlace.direction()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonStyle} onPress={onLocationPress}>
              <LocationSvg fill={"#3752FE"} />
              <Text style={styles.buttonText}>{t.marketPlace.location()}</Text>
            </TouchableOpacity>
          </Row>
        </View>
      </Row>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  buttonText: {
    marginLeft: 5,
    fontSize: fontSize.font8,
    color: "#3752FE",
  },
  container: {
    width: 330,
    padding: 8,
    paddingRight: 16,
    backgroundColor: "white",
    // height: 160,
    borderRadius: 10,
  },
  bigText: { fontSize: fontSize.font16 },
  smallText: {
    fontSize: fontSize.font12,
    color: palette.midGrey,
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
