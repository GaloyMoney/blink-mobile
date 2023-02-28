import React from "react"
import Animated, { PinwheelIn } from "react-native-reanimated"
import { ANIMATION_DELAY, ANIMATION_DURATION } from "./config"

export const SuccessIconAnimation = ({ children }: { children: React.ReactNode }) => {
  return (
    <Animated.View
      entering={PinwheelIn.duration(ANIMATION_DURATION)
        .springify()
        .delay(ANIMATION_DELAY)}
    >
      {children}
    </Animated.View>
  )
}
