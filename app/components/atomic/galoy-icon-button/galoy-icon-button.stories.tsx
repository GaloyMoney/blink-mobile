import React from "react"
import { Story, UseCase } from "../../../../.storybook/views"
import { GaloyEditButton, GaloyIconButton } from "./galoy-icon-button"
import { StyleSheet, Text, View } from "react-native"

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  marginRight: {
    marginRight: 20,
    alignItems: "center",
  },
  marginBottom: {
    marginBottom: 10,
  },
})

const buttonUseCases = (Component, name, props) => {
  return (
    <UseCase text={name}>
      <View style={styles.row}>
        <View style={styles.marginRight}>
          <Text style={styles.marginBottom}>Default</Text>
          <Component {...props} />
        </View>
        <View>
          <Text style={styles.marginBottom}>Disabled</Text>
          <Component disabled {...props} />
        </View>
      </View>
    </UseCase>
  )
}

const iconVariations = [
  {
    name: "Large icon with text",
    props: {
      name: "qr-code",
      size: "large",
      text: "Scan QR Code",
    },
  },
  {
    name: "Icon only",
    props: {
      name: "caret-right",
      size: "medium",
      iconOnly: true,
    },
  },
  {
    name: "Medium icon without text",
    props: {
      name: "qr-code",
      size: "medium",
    },
  },
]

export default {
  title: "Galoy Icon Button",
  component: GaloyIconButton,
}

export const Default = () => (
  <Story>
    {iconVariations.map(({ name, props }) =>
      buttonUseCases(GaloyIconButton, name, props),
    )}
    {buttonUseCases(GaloyEditButton, "Edit button", {})}
  </Story>
)
