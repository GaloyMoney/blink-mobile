import React from "react"
import { TextProps, View } from "react-native"
import { Text } from "react-native-elements"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Animated, {
  Layout,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  useSharedValue,
  ZoomInEasyUp,
} from "react-native-reanimated"
import { palette } from "@app/theme"
import { CustomIcon } from "../custom-icon"

export const Dropdown = ({
  content,
  dropdownTitle,
  titleStyle,
}: {
  dropdownTitle: JSX.Element
  content: JSX.Element
  titleStyle: TextProps
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const open = useSharedValue(false)
  const progress = useDerivedValue(() => (open.value ? withTiming(1) : withTiming(0)))
  const dynamicStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${progress.value * 180}deg` }],
    }
  })
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
    open.value = !open.value
  }

  const renderCollapseIcon = () => {
    return (
      <>
        <TouchableWithoutFeedback
          style={titleStyle}
          onPress={() => {
            toggleDropdown()
          }}
        >
          <Animated.View style={dynamicStyle}>
            <CustomIcon name="custom-chevron-down-icon" color={palette.lapisLazuli} />
          </Animated.View>
        </TouchableWithoutFeedback>
      </>
    )
  }

  return (
    <View>
      <TouchableWithoutFeedback onPress={toggleDropdown}>
        <Text style={titleStyle}>
          {dropdownTitle} {renderCollapseIcon()}
        </Text>
      </TouchableWithoutFeedback>
      {isDropdownOpen && (
        <Animated.View entering={ZoomInEasyUp} layout={Layout.springify()}>
          {content}
        </Animated.View>
      )}
    </View>
  )
}
