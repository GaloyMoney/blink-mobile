import { MockedProvider } from "@apollo/client/testing"
import { ComponentMeta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { MyQuizQuestionsDocument } from "../../graphql/generated"
import { EarnQuiz } from "./earns-quiz"

const mocksNotCompleted = [
  {
    request: {
      query: MyQuizQuestionsDocument,
    },
    result: {
      data: {
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            quiz: [
              {
                id: "WhatIsFiat",
                amount: 5,
                completed: false,
                __typename: "Quiz",
              },
            ],
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
        __typename: "Query",
      },
    },
  },
]

const mocksCompleted = [
  {
    request: {
      query: MyQuizQuestionsDocument,
    },
    result: {
      data: {
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            quiz: [
              {
                id: "WhatIsFiat",
                amount: 5,
                completed: true,
                __typename: "Quiz",
              },
            ],
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
        __typename: "Query",
      },
    },
  },
]

const route = {
  key: "EarnQuiz",
  name: "earnsQuiz",
  params: {
    id: "WhatIsFiat",
  },
} as const

export default {
  title: "Quiz",
  component: EarnQuiz,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as ComponentMeta<typeof EarnQuiz>

export const NotEarned = () => (
  <MockedProvider mocks={mocksNotCompleted} cache={createCache()}>
    <EarnQuiz route={route} />
  </MockedProvider>
)
export const Earned = () => (
  <MockedProvider mocks={mocksCompleted} cache={createCache()}>
    <EarnQuiz route={route} />
  </MockedProvider>
)
