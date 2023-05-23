import { GaloyInfo } from "./galoy-info"
import { StoryScreen, UseCase } from "../../../../.storybook/views"
import React from "react"
import { Meta } from "@storybook/react"

export default {
  title: "Galoy Info",
  component: GaloyInfo,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof GaloyInfo>

export const Default = () => {
  return (
    <>
      <UseCase text="Info with highlight">
        <GaloyInfo>{"Some info with highlight"}</GaloyInfo>
      </UseCase>
      <UseCase text="Really long warning">
        <GaloyInfo>
          {
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,\n\nsunt in culpa qui officia deserunt mollit anim id est laborum."
          }
        </GaloyInfo>
      </UseCase>
    </>
  )
}
