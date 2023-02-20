import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native"

import { color } from "@app/theme"
import { useI18nContext } from "@app/i18n/i18n-react"
import { Row } from "../row"
import { fontSize, typography } from "../../theme/typography"

interface Props {
  onPress: () => void
  style?: ViewStyle
  disableSkip?: boolean
}

export const FooterCreatePost: React.FC<Props> = ({ onPress, style, disableSkip }) => {
  const { LL: t } = useI18nContext()

  return (
    <Row containerStyle={{ justifyContent: "space-between", width: "100%", ...style }}>
      {disableSkip ? (
        <View></View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.text}>{t.marketPlace.skip()}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.text}>{t.marketPlace.next()}</Text>
      </TouchableOpacity>
    </Row>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 7,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontFamily: typography.medium,
    fontSize: fontSize.font16,
    color: "white",
  },
})
