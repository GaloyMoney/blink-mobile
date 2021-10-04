import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StoryScreen } from "../../../storybook/views"
import { SectionCompleted } from "./section-completed"
import { reactNavigationDecorator } from "../../../storybook/storybook-navigator"

declare let module

const route = {
  params: {
    sectionTitle: "Bitcoin: What is it?",
    amount: 5000,
  },
}

storiesOf("Section Completed", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .addDecorator(reactNavigationDecorator)
  .add("Default", () => (
    <SafeAreaProvider>
      <SectionCompleted route={route} />
    </SafeAreaProvider>
  ))
