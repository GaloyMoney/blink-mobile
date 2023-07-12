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

const sliderStartValue = 0
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
    callback,
  } = props

  const [value, setValue] = useState(sliderStartValue)
  const [sliderText, setSliderText] = useState(initialText)

  const onSlidingComplete = () => {
    if (disabled) {
      return
    }
    if (callback) {
      callback()
      if (loading) {
        setSliderText(slidingText)
      }
    }
  }

  React.useEffect(() => {
    if (!loading) {
      setSliderText(completedText)
    }
  }, [loading, completedText])

  React.useEffect(() => {
    if (value === sliderStartValue) {
      setSliderText(initialText)
    }
    if (disabled) {
      setValue(sliderStartValue)
    }
  }, [value, initialText, disabled])

  return (
    <>
      <View>
        <Slider
          disabled={disabled}
          onSlidingComplete={onSlidingComplete}
          value={value}
          onValueChange={setValue}
          maximumValue={sliderMaxValue}
          minimumValue={sliderStartValue}
          step={1}
          trackStyle={styles.trackStyle}
          maximumTrackTintColor={colors.primary3}
          minimumTrackTintColor={colors.primary3}
          thumbTintColor={colors.primary4}
          thumbProps={{
            children: (
              <View style={styles.iconContainerStyle}>
                <GaloyIcon name={"arrow-right"} size={30} color={colors.white} />
              </View>
            ),
          }}
        />
        <View style={styles.slideTextContainer}>
          <Text style={styles.sliderTextStyle}>
            {disabled ? disabledText : sliderText}
          </Text>
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
  iconContainerStyle: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbTouchSize: {
    width: 20,
    height: 20,
  },
  slideTextContainer: {
    position: "absolute",
    flexDirection: "row",
    pointerEvents: "none",
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    height: "100%",
  },
  sliderTextStyle: {
    color: colors.white,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
    fontSize: 20,
    lineHeight: 24,
  },
}))
