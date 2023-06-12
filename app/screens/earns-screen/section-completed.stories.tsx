import { SectionCompleted } from "./section-completed"
import { Meta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { MockedProvider } from "@apollo/client/testing"

const route = {
  key: "SectionCompleted",
  name: "sectionCompleted",
  params: {
    amount: 12,
    sectionTitle: "Bitcoin: What is it?",
  },
} as const

export default {
  title: "SectionCompleted",
  component: SectionCompleted,
  decorators: [
    (Story) => (
      <MockedProvider>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof SectionCompleted>

export const Default = () => <SectionCompleted route={route} />
