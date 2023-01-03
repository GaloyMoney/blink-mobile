import React, { useState } from "react"
import { View } from "react-native"

import { makeStyles, Slider, Text, useTheme } from "@rneui/themed"

import { GaloyIcon } from "../galoy-icon"

type GaloySliderComponentProps = {
  disabled?: boolean
  callback?: () => void
  text?: string
}

enum sliderTextValues {
  send = "slide to send",
  sending = "send",
  sent = "sent!",
  failed = "failed",
}

const sliderStartValue = 6
const sliderMaxValue = 100

export const Sliders: React.FunctionComponent<GaloySliderComponentProps> = (props) => {
  const { theme } = useTheme()
  const styles = useStyles(props)

  const [value, setValue] = useState(sliderStartValue)
  const [showIcon, setShowIcon] = useState<boolean>(true)
  const [sliderText, setSliderText] = useState<sliderTextValues>(sliderTextValues.send)

  React.useEffect(() => {
    if (value === sliderStartValue) {
      setSliderText(sliderTextValues.send)
    }
    if (value >= sliderMaxValue / 2) {
      setValue(sliderMaxValue)
    }
  }, [value])

  const onSlidingComplete = async () => {
    if (value <= sliderMaxValue / 2) {
      setValue(sliderStartValue)
      return
    }
    setShowIcon(false)
    if (props.callback) {
      props.callback()
      setSliderText(() => {
        switch (props.text?.toLowerCase()) {
          case sliderTextValues.send:
            return sliderTextValues.send
          case sliderTextValues.sending:
            return sliderTextValues.sending
          case sliderTextValues.sent:
            return sliderTextValues.sent
          case sliderTextValues.failed:
            return sliderTextValues.failed
          default:
            return sliderTextValues.send
        }
      })
    }
  }

  return (
    <>
      <View style={styles.contentView}>
        <Slider
          disabled={props.disabled}
          onSlidingComplete={onSlidingComplete}
          value={value}
          onValueChange={setValue}
          maximumValue={100}
          minimumValue={0}
          step={1}
          maximumTrackTintColor={theme.colors.primary3}
          minimumTrackTintColor={theme.colors.primary5}
          thumbTintColor={theme.colors.primary5}
          allowTouchTrack={false}
          trackStyle={styles.trackStyle}
          thumbStyle={styles.thumbStyle}
          thumbTouchSize={styles.thumbTouchSize}
          thumbProps={{
            children: (
              <View style={styles.IconContainerStyle}>
                {showIcon ? (
                  <GaloyIcon name={"arrow-right"} size={30} color={theme.colors.white} />
                ) : null}
              </View>
            ),
          }}
        />
        <View style={styles.SlideTextContainer}>
          <Text style={styles.SliderTextStyle}>{sliderText}</Text>
          {sliderText === sliderTextValues.sending && (
            <Text>
              <GaloyIcon name={"arrow-right"} size={30} color={theme.colors.white} />
            </Text>
          )}
        </View>
      </View>
    </>
  )
}

const useStyles = makeStyles((theme, props: GaloySliderComponentProps) => ({
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
    backgroundColor: props.disabled ? theme.colors.primary7 : theme.colors.primary5,
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
    fontWeight: "600",
    fontSize: 20,
    flexDirection: "row",
  },
  SliderTextStyle: {
    color: theme.colors.white,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 20,
    paddingRight: 10,
  },
}))
