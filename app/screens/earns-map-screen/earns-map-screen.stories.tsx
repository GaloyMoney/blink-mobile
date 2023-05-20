import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { MyQuizQuestionsDocument } from "../../graphql/generated"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { EarnMapScreen } from "./earns-map-screen"

const mocksSection0 = [
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
                id: "walletDownloaded",
                amount: 1,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "walletActivated",
                amount: 1,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "whatIsBitcoin",
                amount: 1,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "sat",
                amount: 2,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "whereBitcoinExist",
                amount: 3,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "whoControlsBitcoin",
                amount: 3,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "copyBitcoin",
                amount: 3,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "moneyImportantGovernement",
                amount: 4,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "moneyIsImportant",
                amount: 4,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "whyStonesShellGold",
                amount: 4,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "moneyEvolution",
                amount: 4,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "coincidenceOfWants",
                amount: 4,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "moneySocialAggrement",
                amount: 4,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "WhatIsFiat",
                amount: 5,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "whyCareAboutFiatMoney",
                amount: 5,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "GovernementCanPrintMoney",
                amount: 5,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "FiatLosesValueOverTime",
                amount: 5,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "OtherIssues",
                amount: 5,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "LimitedSupply",
                amount: 6,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "Decentralized",
                amount: 6,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "NoCounterfeitMoney",
                amount: 6,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "HighlyDivisible",
                amount: 6,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "securePartOne",
                amount: 6,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "securePartTwo",
                amount: 6,
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

const mocksSection1 = [
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
                id: "walletDownloaded",
                amount: 1,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "walletActivated",
                amount: 1,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "whatIsBitcoin",
                amount: 1,
                completed: true,
                __typename: "Quiz",
              },
              {
                id: "sat",
                amount: 2,
                completed: true,
                __typename: "Quiz",
              },
              {
                id: "whereBitcoinExist",
                amount: 3,
                completed: true,
                __typename: "Quiz",
              },
              {
                id: "whoControlsBitcoin",
                amount: 3,
                completed: true,
                __typename: "Quiz",
              },
              {
                id: "copyBitcoin",
                amount: 3,
                completed: true,
                __typename: "Quiz",
              },
              {
                id: "moneyImportantGovernement",
                amount: 4,
                completed: true,
                __typename: "Quiz",
              },
              {
                id: "moneyIsImportant",
                amount: 4,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "whyStonesShellGold",
                amount: 4,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "moneyEvolution",
                amount: 4,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "coincidenceOfWants",
                amount: 4,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "moneySocialAggrement",
                amount: 4,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "WhatIsFiat",
                amount: 5,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "whyCareAboutFiatMoney",
                amount: 5,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "GovernementCanPrintMoney",
                amount: 5,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "FiatLosesValueOverTime",
                amount: 5,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "OtherIssues",
                amount: 5,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "LimitedSupply",
                amount: 6,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "Decentralized",
                amount: 6,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "NoCounterfeitMoney",
                amount: 6,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "HighlyDivisible",
                amount: 6,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "securePartOne",
                amount: 6,
                completed: false,
                __typename: "Quiz",
              },
              {
                id: "securePartTwo",
                amount: 6,
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

export default {
  title: "Map Earn",
  component: EarnMapScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof EarnMapScreen>

export const Unauthed = () => (
  <MockedProvider mocks={mocksSection0} cache={createCache()}>
    <IsAuthedContextProvider value={false}>
      <EarnMapScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
export const AuthedSection0 = () => (
  <MockedProvider mocks={mocksSection0} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <EarnMapScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
export const AuthedSection1 = () => (
  <MockedProvider mocks={mocksSection1} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <EarnMapScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
