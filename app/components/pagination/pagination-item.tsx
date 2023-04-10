import { palette } from "@app/theme"
import * as React from "react"
import { StyleSheet, View } from "react-native"
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated"

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.white,
    borderRadius: 50,
    overflow: "hidden",
  },
  animatedStyle: {
    borderRadius: 50,
    flex: 1,
  },
})

export const PaginationItem: React.FC<{
  index: number
  backgroundColor: string
  length: number
  animValue: Animated.SharedValue<number>
  isRotate?: boolean
}> = (props) => {
  const { animValue, index, length, backgroundColor, isRotate } = props
  const width = 10
  const containerDynamicStyle = {
    height: width,
    width,
    transform: [
      {
        rotateZ: isRotate ? "90deg" : "0deg",
      },
    ],
  }

  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1]
    let outputRange = [-width, 0, width]

    if (index === 0 && animValue?.value > length - 1) {
      inputRange = [length - 1, length, length + 1]
      outputRange = [-width, 0, width]
    }

    return {
      transform: [
        {
          translateX: interpolate(
            animValue?.value,
            inputRange,
            outputRange,
            Extrapolate.CLAMP,
          ),
        },
      ],
    }
  }, [animValue, index, length])
  return (
    <View style={[styles.container, containerDynamicStyle]}>
      <Animated.View style={[styles.animatedStyle, { backgroundColor }, animStyle]} />
    </View>
  )
}
