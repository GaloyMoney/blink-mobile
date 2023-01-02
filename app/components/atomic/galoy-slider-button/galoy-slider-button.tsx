import React, { useState } from "react"
import { View } from "react-native"

import colors from "@app/rne-theme/colors"
import { makeStyles, Slider, Text, useTheme } from "@rneui/themed"

import { GaloyIcon } from "../galoy-icon"

// eslint-disable-next-line @typescript-eslint/ban-types
type SlidersComponentProps = {}

export const Sliders: React.FunctionComponent<SlidersComponentProps> = () => {
  const { theme } = useTheme()
  const styles = useStyles(theme)
  const [value, setValue] = useState(0)

  //   const interpolate = (start: number, end: number) => {
  //     let k = (value - 0) / 10 // 0 =>min  && 10 => MAX
  //     return Math.ceil((1 - k) * start + k * end) % 256
  //   }

  //   const color = () => {
  //     let r = interpolate(255, 0)
  //     let g = interpolate(0, 255)
  //     let b = interpolate(0, 0)
  //     return `rgb(${r},${g},${b})`
  //   }

  return (
    <>
      <View style={styles.contentView}>
        <Slider
          value={value}
          onValueChange={setValue}
          maximumValue={30}
          minimumValue={0}
          step={1}
          maximumTrackTintColor={theme.colors.primary3}
          minimumTrackTintColor={theme.colors.primary5}
          allowTouchTrack
          trackStyle={styles.trackStyle}
          thumbStyle={styles.thumbStyle}
          thumbTintColor={theme.colors.primary5}
          thumbTouchSize={styles.thumbTouchSize}
          thumbProps={{
            children: (
              <View style={styles.IconContainerStyle}>
                <GaloyIcon name={"arrow-right"} size={30} color={colors.error4} />
              </View>
            ),
          }}
        />
        <Text style={styles.SlideTextStyle}>Slide to send</Text>
      </View>
      {/* <Text style={{ paddingTop: 20, bottom: 50, color: colors.white }}>
        Value: {value}
      </Text> */}
    </>
  )
}

const useStyles = makeStyles((theme) => ({
  contentView: {
    padding: 20,
    width: "100%",
    justifyContent: "center",
    alignItems: "stretch",
  },
  trackStyle: {
    height: 40,
    borderRadius: 40,
  },
  IconContainerStyle: {
    bottom: -5,
    right: -8,
  },
  thumbStyle: {
    height: 40,
    width: 45,
    color: theme.colors.verticalBlue,
    borderRadius: 40,
  },
  SlideTextStyle: {
    color: colors.white,
    paddingTop: 20,
    bottom: 55,
    left: 115,
    fontWeight: "600",
    fontSize: 20,
  },
  thumbTouchSize: {
    width: 20,
    height: 20,
  },
}))
