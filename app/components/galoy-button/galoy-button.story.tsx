import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import { GaloyButton } from "./"

storiesOf("Galoy Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Submit Button", () => (
    <Story>
      <UseCase text="Set Username" usage="Not loading">
        <GaloyButton
          text="Set your BBW address"
          onPress={() => console.log("submitting")}
        />
      </UseCase>
    </Story>
  ))
