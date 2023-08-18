import { Animated, Easing, Pressable, View } from "react-native"

import { makeStyles, Text } from "@rneui/themed"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"

import { useRef } from "react"

import { useI18nContext } from "@app/i18n/i18n-react"
import { useCirclesCard } from "./use-circles-card"

export const ShareCircles = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  const { ShareImg, share } = useCirclesCard()

  const scaleAnim = useRef(new Animated.Value(1)).current

  const breatheIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.quad),
    }).start()
  }

  const breatheOut = () => {
    share()
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.quad),
    }).start()
  }

  return (
    <>
      {ShareImg}
      <Pressable onPressIn={breatheIn} onPressOut={breatheOut}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={styles.container}>
            <Text type="p1">{LL.Circles.shareCircles()}</Text>
            <View style={styles.iconContainer}>
              <GaloyIconButton name="share" size="medium" iconOnly onPress={share} />
            </View>
          </View>
        </Animated.View>
      </Pressable>
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
