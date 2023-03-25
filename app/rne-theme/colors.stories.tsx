import React from "react"
import { Text } from "@rneui/themed"
import { light, dark } from "@app/rne-theme/colors"
import { View } from "react-native"

const themeLight = Object.keys(light).filter(
  (key) => key !== "horizonBlue" && key !== "verticalBlue",
)
const themeDark = Object.keys(dark).filter(
  (key) => key !== "horizonBlue" && key !== "verticalBlue",
)

const styles = {
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  colorWrapper: {
    marginRight: 10,
    marginBottom: 10,
  },
} as const

export default {
  title: "Colors",
}

const Template = ({ theme, colors }) => {
  const colorBox = (color) => ({
    height: 40,
    width: 70,
    backgroundColor: colors[color],
    borderColor: "grey",
    borderWidth: 1,
  })

  return (
    <View style={styles.container}>
      {theme.map((color) => (
        <View key={color} style={styles.colorWrapper}>
          <View style={colorBox(color)} />
          <Text type="p2">{color}</Text>
        </View>
      ))}
    </View>
  )
}

export const Light = Template.bind({})
Light.args = { theme: themeLight, colors: light }

export const Dark = Template.bind({})
Dark.args = { theme: themeDark, colors: dark }
