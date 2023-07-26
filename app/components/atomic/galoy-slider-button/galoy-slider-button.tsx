import React, { useState } from "react"
import { View, Text } from "react-native"

import { makeStyles, useTheme } from "@rneui/themed"

import { GaloyIcon } from "../galoy-icon"
import RNSliderIconButton from "react-native-slider-icon-button"

type GaloySliderComponentProps = {
  disabled?: boolean
  loading?: boolean
  showSlidingTextIcon?: boolean
  callback?: () => void
  initialText?: string
  slidingText?: string
  completedText?: string
}

export const GaloySliderButton: React.FunctionComponent<GaloySliderComponentProps> = (
  props,
) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles(props)
  const { disabled, loading, initialText, completedText, slidingText, callback } = props

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
    if (!loading && completedText) {
      setSliderText(completedText)
    }
  }, [loading, completedText])

  React.useEffect(() => {
    if (disabled) {
      setSliderText(initialText)
    }
  }, [initialText, disabled])

  return (
    <>
      <View>
        <RNSliderIconButton
          loading={loading}
          disabled={disabled}
          buttonSize={60}
          buttonColor={colors.primary3}
          borderRadius={100}
          onVerified={onSlidingComplete}
          iconColor={colors.primary4}
          icon={
            <View>
              <GaloyIcon size={30} name="arrow-right" />
            </View>
          }
        >
          <Text style={styles.sliderTextStyle}>{sliderText}</Text>
        </RNSliderIconButton>
      </View>
    </>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  sliderTextStyle: {
    color: colors.white,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
    fontSize: 20,
    lineHeight: 24,
  },
}))
