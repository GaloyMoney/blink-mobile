import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native"

import { color } from "@app/theme"
import { images } from "@app/modules/market-place/assets/images"
import { MarketPlaceParamList } from "@app/modules/market-place/navigation/param-list"
import { StackNavigationProp } from "@react-navigation/stack"

import { useI18nContext } from "@app/i18n/i18n-react"
import { Row } from "@app/modules/market-place/components/row"
import { useNavigation } from "@react-navigation/native"
import { fontSize } from "@app/modules/market-place/theme/typography"

export const EditButton = () => {

  const navigation = useNavigation<StackNavigationProp<MarketPlaceParamList>>();

  const { LL: t } = useI18nContext()

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => navigation.navigate("AddImage")}
    >
      <Row containerStyle={styles.headerRow}>
        <Text style={styles.headerText}>
          {t.marketPlace.update_cover_image()}
        </Text>
        <Image
          source={images.uploadIcon}
          style={{ width: 25, height: 19, marginLeft: 5 }}
        />
      </Row>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  headerRow: {
    backgroundColor: color.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: fontSize.font14,
  },
})
