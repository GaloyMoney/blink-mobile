import React, { useState } from "react"
import { View, Text } from "react-native"

import { makeStyles, Slider, useTheme } from "@rneui/themed"

import { GaloyIcon } from "../galoy-icon"

type GaloySliderComponentProps = {
  disabled?: boolean
  loading?: boolean
  showSlidingTextIcon?: boolean
  callback?: () => void
  initialText?: string
  slidingText?: string
  disabledText?: string
  completedText?: string
}

const sliderStartValue = 6
const sliderMaxValue = 100

export const GaloySliderButton: React.FunctionComponent<GaloySliderComponentProps> = (
  props,
) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles(props)
  const {
    disabled,
    loading,
    initialText,
    completedText,
    slidingText,
    disabledText,
    showSlidingTextIcon,
    callback,
  } = props

  const [value, setValue] = useState(sliderStartValue)
  const [showIcon, setShowIcon] = useState<boolean>(true)
  const [sliderText, setSliderText] = useState(initialText)

  const onSlidingComplete = () => {
    if (value <= sliderMaxValue / 3) {
      setValue(sliderStartValue)
      return
    }
    setShowIcon(false)
    if (callback) {
      callback()
      if (loading) {
        setSliderText(slidingText)
      }
    }
  }

  const slidingTextIcon =
    showSlidingTextIcon && !disabled && sliderText === slidingText ? (
      <Text>
        <GaloyIcon name={"arrow-right"} size={30} color={colors.white} />
      </Text>
    ) : undefined

  React.useEffect(() => {
    if (!loading) {
      setSliderText(completedText)
    }
  }, [loading, completedText])

  React.useEffect(() => {
    if (value === sliderStartValue) {
      setSliderText(initialText)
    }
    if (value >= sliderMaxValue / 3) {
      setValue(sliderMaxValue)
    }
  }, [value, initialText])

  return (
    <>
      <View style={styles.contentView}>
        <Slider
          disabled={disabled}
          onSlidingComplete={onSlidingComplete}
          value={value}
          onValueChange={setValue}
          maximumValue={100}
          minimumValue={0}
          step={1}
          maximumTrackTintColor={colors.primary3}
          minimumTrackTintColor={colors.primary5}
          thumbTintColor={colors.primary5}
          allowTouchTrack={false}
          trackStyle={styles.trackStyle}
          thumbStyle={styles.thumbStyle}
          thumbTouchSize={styles.thumbTouchSize}
          thumbProps={{
            children: (
              <View style={styles.IconContainerStyle}>
                {showIcon ? (
                  <GaloyIcon name={"arrow-right"} size={30} color={colors.white} />
                ) : undefined}
              </View>
            ),
          }}
        />
        <View style={styles.SlideTextContainer}>
          <Text style={styles.SliderTextStyle}>
            {disabled ? disabledText : sliderText}
          </Text>
          {slidingTextIcon}
        </View>
      </View>
    </>
  )
}

const useStyles = makeStyles(({ colors }, props: GaloySliderComponentProps) => ({
  contentView: {
    padding: 0,
    width: "100%",
    justifyContent: "center",
    alignItems: "stretch",
  },
  trackStyle: {
    height: 40,
    borderRadius: 100,
    opacity: props.disabled ? 0.2 : undefined,
  },
  IconContainerStyle: {
    bottom: 10,
    left: props.disabled ? -12 : -10.5,
    backgroundColor: props.disabled ? colors.primary3 : colors.primary5,
    height: 20,
    width: 20,
    padding: 20,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbStyle: {
    height: 20,
    width: 20,
    left: -10,
  },
  thumbTouchSize: {
    width: 20,
    height: 20,
  },
  SlideTextContainer: {
    width: "50%",
    textAlign: "center",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: 20,
    bottom: 53.5,
    left: 100,
    flexDirection: "row",
  },
  SliderTextStyle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
    color: colors.white,
  },
}))
