import { GaloyWarning } from "./galoy-warning"
import { StoryScreen, UseCase } from "../../../../.storybook/views"
import React from "react"
import { Meta } from "@storybook/react"
import { View } from "react-native"

export default {
  title: "Galoy Warning",
  component: GaloyWarning,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof GaloyWarning>

export const Default = () => {
  return (
    <View>
      <UseCase text="Warning">
        <GaloyWarning errorMessage="Something went wrong" />
      </UseCase>
      <UseCase text="Warning with highlight">
        <GaloyWarning errorMessage="Something went wrong" highlight />
      </UseCase>
      <UseCase text="Warning with no icon">
        <GaloyWarning errorMessage="Something went wrong" noIcon />
      </UseCase>
      <UseCase text="Really long warning">
        <GaloyWarning
          highlight
          errorMessage="Something that is really long and takes up a lot of space to see what it looks like when it is really long and takes up a lot of space"
        />
      </UseCase>
    </View>
  )
}
