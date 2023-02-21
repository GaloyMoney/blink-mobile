import { SectionCompleted } from "./section-completed"
import { ComponentMeta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"

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
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as ComponentMeta<typeof SectionCompleted>

export const Default = () => <SectionCompleted route={route} />
