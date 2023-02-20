import { useI18nContext } from "@app/i18n/i18n-react"
import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import { Dimensions, StyleSheet, Text, View } from "react-native"
import { fontSize, typography } from "../../../theme/typography"
type Props = {}
const { width } = Dimensions.get("window")
export const EmptyComponent: React.FC<Props> = () => {
  const { LL: t } = useI18nContext()

  return (
    <View style={styles.container}>
      <Text style={styles.emptyText}>{t.marketPlace.there_are_no_posts()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  emptyText: {
    fontFamily: typography.medium,
    fontSize: fontSize.font18,
    color: "#9499A5",
    alignSelf: "center",
  },
  container: {
    width: width - 40,
    padding: 8,
    paddingRight: 16,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 50,
  },
})
