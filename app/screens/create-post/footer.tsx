import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import { Row } from "@app/components/row"
import { eng } from "@app/constants/en"
import { fontSize, palette, typography } from "@app/theme"
import { useTranslation } from "react-i18next"
const { width, height } = Dimensions.get("window")
const IMAGE_WIDTH = width - 32 * 2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.635
interface Props {
  onPress: () => void
  style?: ViewStyle
  disableSkip?: boolean
}
export const FooterCreatePost: React.FC<Props> = ({ onPress, style, disableSkip }) => {
  const { t } = useTranslation()
  return (
    <Row containerStyle={{ justifyContent: "space-between", width: "100%", ...style }}>
      {disableSkip ?<View></View> : 
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={[styles.text]}>{t("skip")}</Text>
        </TouchableOpacity>}
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={[styles.text]}>{t("next")}</Text>
      </TouchableOpacity>
    </Row>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 7,
    backgroundColor: palette.orange,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontFamily: typography.medium,
    fontSize: fontSize.font16,
    color: "white",
  },
})
