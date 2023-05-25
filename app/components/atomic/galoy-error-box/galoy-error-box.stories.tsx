import { GaloyErrorBox } from "./galoy-error-box"
import { StoryScreen, UseCase } from "../../../../.storybook/views"
import React from "react"
import { Meta } from "@storybook/react"
import { View } from "react-native"

export default {
  title: "Galoy Error Box",
  component: GaloyErrorBox,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof GaloyErrorBox>

export const Default = () => {
  return (
    <View>
      <UseCase text="Warning with highlight">
        <GaloyErrorBox errorMessage="Something went wrong" />
      </UseCase>
      <UseCase text="Warning with no icon">
        <GaloyErrorBox errorMessage="Something went wrong" noIcon />
      </UseCase>
      <UseCase text="Really long warning">
        <GaloyErrorBox errorMessage="Something that is really long and takes up a lot of space to see what it looks like when it is really long and takes up a lot of space" />
      </UseCase>
    </View>
  )
}
