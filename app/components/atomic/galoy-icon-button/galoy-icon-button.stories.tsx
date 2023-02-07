import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../../.storybook/views"
import { GaloyEditButton, GaloyIconButton } from "./galoy-icon-button"
import { Text, View } from "react-native"

const buttonUseCases = (Component, name, props) => {
  return (
    <>
      <UseCase text={name}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ marginRight: 20, alignItems: "center" }}>
            <Text style={{ marginBottom: 10 }}>Default</Text>
            <Component {...props} />
          </View>
          <View>
            <Text style={{ marginBottom: 10 }}>Disabled</Text>
            <Component disabled {...props} />
          </View>
        </View>
      </UseCase>
    </>
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

storiesOf("Galoy Icon Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      {iconVariations.map(({ name, props }) =>
        buttonUseCases(GaloyIconButton, name, props),
      )}
      {buttonUseCases(GaloyEditButton, "Edit button", {})}
    </Story>
  ))
