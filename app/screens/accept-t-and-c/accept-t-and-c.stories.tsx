import React from "react"

import { StoryScreen } from "../../../.storybook/views"
import { AcceptTermsAndConditionsScreen } from "./accept-t-and-c"

export default {
  title: "AcceptTAndC",
  component: AcceptTermsAndConditionsScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
}

export const Default = () => <AcceptTermsAndConditionsScreen />
