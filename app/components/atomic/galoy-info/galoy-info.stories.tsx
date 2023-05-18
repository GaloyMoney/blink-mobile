import { GaloyInfo } from "./galoy-info"
import { StoryScreen, UseCase } from "../../../../.storybook/views"
import React from "react"
import { Meta } from "@storybook/react"
import { View } from "react-native"

export default {
  title: "Galoy Info",
  component: GaloyInfo,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof GaloyInfo>

export const Default = () => {
  return (
    <View>
      <UseCase text="Info">
        <GaloyInfo infoMessage="Some info" />
      </UseCase>
      <UseCase text="Info with highlight">
        <GaloyInfo infoMessage="Some info with highlight" highlight />
      </UseCase>
      <UseCase text="Really long warning">
        <GaloyInfo
          highlight
          infoMessage="Some really long info Some really long info Some really long info Some really long info Some really long info Some really long info Some really long info Some really long info "
        />
      </UseCase>
    </View>
  )
}
