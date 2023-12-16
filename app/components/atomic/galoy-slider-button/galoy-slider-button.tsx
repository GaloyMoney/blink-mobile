import React, { useEffect } from "react"
import { ActivityIndicator, Dimensions, View } from "react-native"
import { PanGestureHandler } from "react-native-gesture-handler"
import Animated, {
  Extrapolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { GaloyIcon } from "../galoy-icon"
import { Text, makeStyles, useTheme } from "@rneui/themed"

const BUTTON_WIDTH = Dimensions.get("screen").width - 40
const SWIPE_RANGE = BUTTON_WIDTH - 50

type SwipeButtonPropsType = {
  onSwipe: () => void
  initialText: string
  loadingText: string
  isLoading?: boolean
  disabled?: boolean
}

const GaloySliderButton = ({
  onSwipe,
  initialText,
  loadingText,
  isLoading = false,
  disabled = false,
}: SwipeButtonPropsType) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const X = useSharedValue(0)

  useEffect(() => {
    if (!isLoading) {
      X.value = withSpring(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const animatedGestureHandler = useAnimatedGestureHandler({
    onActive: (e) => {
      const newValue = e.translationX

      if (newValue >= 0 && newValue <= SWIPE_RANGE) {
        X.value = newValue
      }
    },
    onEnd: () => {
      if (X.value < SWIPE_RANGE * 0.6) {
        X.value = withSpring(0)
      } else {
        runOnJS(onSwipe)()
      }
    },
  })

  const AnimatedStyles = {
    swipeButton: useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateX: interpolate(
              X.value,
              [20, BUTTON_WIDTH],
              [0, BUTTON_WIDTH],
              Extrapolation.CLAMP,
            ),
          },
        ],
      }
    }, [X]),
    swipeText: useAnimatedStyle(() => {
      return {
        opacity: interpolate(X.value, [0, BUTTON_WIDTH / 4], [1, 0], Extrapolate.CLAMP),
        transform: [
          {
            translateX: interpolate(
              X.value,
              [20, SWIPE_RANGE],
              [0, BUTTON_WIDTH / 3],
              Extrapolate.CLAMP,
            ),
          },
        ],
      }
    }, [X]),
  }

  return (
    <View style={styles.swipeButtonContainer}>
      {!isLoading && (
        <PanGestureHandler
          enabled={!isLoading && !disabled}
          onGestureEvent={animatedGestureHandler}
        >
          <Animated.View
            style={[
              styles.swipeButton,
              AnimatedStyles.swipeButton,
              { backgroundColor: disabled ? colors.disabled : colors.primary },
            ]}
            exiting={FadeOut.duration(400)}
          >
            <GaloyIcon size={30} name="arrow-right" color="white" />
          </Animated.View>
        </PanGestureHandler>
      )}
      {!disabled && (
        <Animated.Text style={[styles.swipeText, AnimatedStyles.swipeText]}>
          {initialText}
        </Animated.Text>
      )}
      {isLoading && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.loadingContainer}>
          <Text style={styles.swipeText}>{loadingText}</Text>
          <ActivityIndicator size="small" color={colors.primary} />
        </Animated.View>
      )}
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  swipeButtonContainer: {
    height: 60,
    backgroundColor: colors.grey5,
    borderRadius: 30,
    borderColor: colors.grey4,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: BUTTON_WIDTH,
    position: "relative",
  },
  swipeButton: {
    position: "absolute",
    left: 0,
    height: 60,
    width: 60,
    borderRadius: 30,
    zIndex: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  swipeButtonDisabled: {
    backgroundColor: "#E4E9EE",
  },
  swipeText: {
    alignSelf: "center",
    fontSize: 14,
    fontWeight: "400",
    zIndex: 2,
    color: colors.grey2,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 10,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
}))

export default GaloySliderButton
