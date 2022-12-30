import React, { useState } from "react"
import { View, StyleSheet } from "react-native"
import { Slider, Text } from "@rneui/themed"
import { GaloyIcon } from "../galoy-icon"
import colors from "@app/rne-theme/colors"

const styles = StyleSheet.create({
  contentView: {
    padding: 20,
    width: "100%",
    justifyContent: "center",
    alignItems: "stretch",
  },
  verticalContent: {
    padding: 20,
    flex: 1,
    flexDirection: "row",
    height: 500,
    justifyContent: "center",
    alignItems: "stretch",
  },
  subHeader: {
    backgroundColor: "#2089dc",
    color: "white",
    textAlign: "center",
    paddingVertical: 5,
    marginBottom: 10,
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
    color: colors.verticalBlue,
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
})

// eslint-disable-next-line @typescript-eslint/ban-types
type SlidersComponentProps = {}

export const Sliders: React.FunctionComponent<SlidersComponentProps> = () => {
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
          maximumTrackTintColor={"#4453E2"}
          minimumTrackTintColor={"#5269FF"}
          allowTouchTrack
          trackStyle={styles.trackStyle}
          thumbStyle={styles.thumbStyle}
          thumbTintColor={"#5269FF"}
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

// export default Sliders;
