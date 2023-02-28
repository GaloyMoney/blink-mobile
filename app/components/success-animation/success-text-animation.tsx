import React from "react"
import Animated, { ZoomInEasyUp } from "react-native-reanimated"
import { ANIMATION_DELAY, ANIMATION_DURATION } from "./config"

export const SuccessTextAnimation = ({ children }: { children: React.ReactNode }) => {
  return (
    <Animated.View
      entering={ZoomInEasyUp.duration(ANIMATION_DURATION)
        .springify()
        .delay(ANIMATION_DELAY)}
    >
      {children}
    </Animated.View>
  )
}
