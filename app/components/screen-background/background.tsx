import { View, ImageBackground } from "react-native"
import React from "react"
import BackgroundSVG from "./background.svg"
import EStyleSheet from "react-native-extended-stylesheet"
import { BackgroundProps } from "./background.props"
import ImageBG from "./background.png"

const styles = EStyleSheet.create({
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
})

export function Background(props: BackgroundProps) {
  return (
    <ImageBackground source={ImageBG} style={styles.background}>
      {props.children}
    </ImageBackground>
  )
}
