import React from "react"
import { Animated, Easing, Pressable } from "react-native"

type PressableCardProps = {
  onPress: () => void
}

export const PressableCard: React.FC<React.PropsWithChildren<PressableCardProps>> = ({
  children,
  onPress,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current

  const breatheIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.quad),
    }).start()
  }

  const breatheOut = () => {
    onPress()
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.quad),
    }).start()
  }

  return (
    <Pressable onPressIn={breatheIn} onPressOut={breatheOut}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </Pressable>
  )
}
