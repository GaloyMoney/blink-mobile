import React from "react"
import { Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

import { storiesOf } from "@storybook/react-native"

import { Story, StoryScreen, UseCase } from "../../../../storybook/views"
import { GaloyIcon } from "../galoy-icon"
import { GaloyInputRedesigned } from "./galoy-redesigned-input"

const styles = EStyleSheet.create({
  textStyleIcon: {
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  paddedInput: {
    paddingBottom: 20,
  },
})

storiesOf("Galoy Input Redsigned", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Default">
        <GaloyInputRedesigned
          forceKeyboard={false}
          placeholder={"placeholder"}
          label={"Input Label"}
        />
      </UseCase>
      <UseCase text="Focused input">
        <GaloyInputRedesigned
          label={"Input Label"}
          forceKeyboard={false}
          placeholder={"placeholder"}
          initIsFocused={true}
        />
      </UseCase>
      <UseCase text="Input with CustomIcon">
        <GaloyInputRedesigned
          forceKeyboard={false}
          label={"Input Label"}
          placeholder={"placeholder"}
          leftIcon={<GaloyIcon name="bitcoin" size={30} color="blue" />}
        />
      </UseCase>
      <UseCase text="Input with TextIcon">
        <GaloyInputRedesigned
          forceKeyboard={false}
          label={"Input Label"}
          placeholder={"placeholder"}
          leftIcon={<Text style={styles.textStyleIcon}>usd</Text>}
        />
      </UseCase>
      <UseCase text="Input with padding">
        <GaloyInputRedesigned
          forceKeyboard={false}
          label={"Input Label"}
          inputContainerStyle={styles.paddedInput}
          value={"123.45"}
          caption={"caption"}
          placeholder={"placeholder"}
        />
      </UseCase>
      <UseCase text="Error">
        <GaloyInputRedesigned
          forceKeyboard={false}
          label={"Input Label"}
          placeholder={"placeholder"}
          errorMessage={"Ooops! something went wrong!"}
        />
      </UseCase>
    </Story>
  ))
