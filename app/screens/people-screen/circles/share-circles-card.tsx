import { View } from "react-native"

import { makeStyles, Text } from "@rneui/themed"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"

import { useI18nContext } from "@app/i18n/i18n-react"
import { useCirclesCard } from "./use-circles-card"
import { PressableCard } from "@app/components/pressable-card"

export const ShareCircles = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  const { ShareImg, share } = useCirclesCard()

  return (
    <>
      {ShareImg}
      <PressableCard onPress={share}>
        <View style={styles.container}>
          <Text type="p1">{LL.Circles.shareCircles()}</Text>
          <View style={styles.iconContainer}>
            <GaloyIconButton name="share" size="medium" iconOnly onPress={share} />
          </View>
        </View>
      </PressableCard>
    </>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    backgroundColor: colors.grey5,
    display: "flex",
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 12,
    padding: 12,
    columnGap: 4,
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    display: "flex",
    flexDirection: "row",
    columnGap: 10,
  },
}))
