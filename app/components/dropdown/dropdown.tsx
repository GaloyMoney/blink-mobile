import { palette } from "@app/theme"
import { Text } from "@rneui/base"
import React from "react"
import { StyleProp, TextStyle, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Animated, {
  Layout,
  ZoomInEasyUp,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { CustomIcon } from "../custom-icon"

const styles = EStyleSheet.create({
  fieldNameContainer: {
    flexDirection: "row",
  },
  fieldNameComponent: {
    justifyContent: "center",
  },
})

type Props = {
  icon?: string
  dropdownTitle: string
  content: React.ReactNode
  titleStyle: StyleProp<TextStyle>
}

export const Dropdown: React.FC<Props> = ({
  icon,
  content,
  dropdownTitle,
  titleStyle,
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
        <View style={styles.fieldNameContainer}>
          {icon && (
            <View style={styles.fieldNameComponent}>
              <CustomIcon name={icon} color={palette.lapisLazuli} />
            </View>
          )}
          <Text style={titleStyle}>
            {icon && " "}
            {dropdownTitle} {renderCollapseIcon()}
          </Text>
        </View>
      </TouchableWithoutFeedback>
      {isDropdownOpen && (
        <Animated.View entering={ZoomInEasyUp} layout={Layout.springify()}>
          {content}
        </Animated.View>
      )}
    </View>
  )
}
