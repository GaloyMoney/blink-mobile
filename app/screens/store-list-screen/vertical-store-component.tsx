import { fontSize, GlobalStyles, typography } from "@app/theme"
import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { images } from "@app/assets/images"
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
        source={
          product?.mainImageUrl ? { uri: product.mainImageUrl } : images.placeholderImage
        }
      />
      <View style={{ padding: 10 }}>
        <Text style={{ fontFamily: typography.bold, fontSize: fontSize.font14 }}>
          $ {product.price}
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
