import React from "react"
import { Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

import { storiesOf } from "@storybook/react-native"

import { Story, StoryScreen, UseCase } from "../../../../.storybook/views"
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
        <GaloyInputRedesigned placeholder={"placeholder"} label={"Form Label"} />
      </UseCase>
      <UseCase text="Focused input">
        <GaloyInputRedesigned
          label={"Form Label"}
          placeholder={"placeholder"}
          initIsFocused={true}
        />
      </UseCase>
      <UseCase text="Input with CustomIcon">
        <GaloyInputRedesigned
          label={"Form Label"}
          placeholder={"placeholder"}
          leftIcon={<GaloyIcon name="bitcoin" size={30} color="blue" />}
        />
      </UseCase>
      <UseCase text="Input with TextIcon and No Label">
        <GaloyInputRedesigned
          placeholder={"placeholder"}
          leftIcon={<Text style={styles.textStyleIcon}>usd</Text>}
        />
      </UseCase>
      <UseCase text="Input with padding">
        <GaloyInputRedesigned
          label={"Form Label"}
          inputContainerStyle={styles.paddedInput}
          caption={"caption"}
          placeholder={"placeholder"}
        />
      </UseCase>
      <UseCase text="Error">
        <GaloyInputRedesigned
          label={"Input Label"}
          placeholder={"placeholder"}
          errorMessage={"Ooops! something went wrong!"}
        />
      </UseCase>
    </Story>
  ))
