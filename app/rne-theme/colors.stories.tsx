import React from "react"
import { createTheme, Text } from "@rneui/themed"
import { light, dark } from "@app/rne-theme/colors"
import { ScrollView, View } from "react-native"

const theme = createTheme({ lightColors: light, darkColors: dark })

if (!theme.lightColors || !theme.darkColors) {
  throw Error("colors undefined")
}

const colorsLight = Object.entries(theme.lightColors)
  .filter(([_, value]) => typeof value === "string")
  .sort()

const colorsDark = Object.entries(theme.darkColors)
  .filter(([_, value]) => typeof value === "string")
  .sort()

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

const Template = ({ colors }) => {
  const colorBox = (value) => ({
    height: 40,
    width: 100,
    backgroundColor: value,
    borderColor: "grey",
    borderWidth: 1,
  })

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {colors.map(([name, value]) => (
        <View key={name} style={styles.colorWrapper}>
          <View style={colorBox(value)} />
          <Text type="p2">{name}</Text>
        </View>
      ))}
    </ScrollView>
  )
}

export const Light = Template.bind({})
Light.args = { colors: colorsLight }

export const Dark = Template.bind({})
Dark.args = { colors: colorsDark }
