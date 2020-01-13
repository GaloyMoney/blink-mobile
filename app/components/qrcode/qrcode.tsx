import React from "react"
import { StyleSheet, View, Image, ViewPropTypes } from "react-native"
import PropTypes from "prop-types"
import QRImage from "qr-image"
import { color } from "../../theme/color"

const styles = StyleSheet.create({
  base: {
    backgroundColor: color.background,
    borderRadius: 13,
    padding: 30,
  },
})

export const QRCode = ({ children = "", size = 180, style }) => {
  const uri = `data:image/png;base64,${QRImage.imageSync(children, {
    type: "png",
    size: 10,
    margin: 0,
  }).toString("base64")}`
  return (
    <View style={[styles.base, style]}>
      <Image source={{ uri }} style={{ width: size, height: size }} />
    </View>
  )
}

QRCode.propTypes = {
  children: PropTypes.string.isRequired,
  size: PropTypes.number,
  style: ViewPropTypes.style,
}
