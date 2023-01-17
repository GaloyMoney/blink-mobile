import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import { SectionCompleted } from "./section-completed"

const route = {
  params: {
    sectionTitle: "Bitcoin: What is it?",
    amount: 5000,
  },
}

storiesOf("Section Completed", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <SafeAreaProvider>
      <Story>
        <UseCase text="not earned">
        {/* TODO: look at the type issue when using the storybook */}
        {/* eslint-disable-next-line */}
        {/* @ts-ignore */}
          <SectionCompleted route={route} />
        </UseCase>
      </Story>
    </SafeAreaProvider>
  ))
