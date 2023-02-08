import React from "react"
import { HomeScreen } from "./home-screen"
import { StoryScreen } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { MainUnauthedDocument } from "../../graphql/generated"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"

export default {
  title: "Home Screen",
  component: HomeScreen,
  decorators: [
    (Story) => <MockedProvider mocks={mocks}><IsAuthedContextProvider value={false}><StoryScreen>{Story()}</StoryScreen></IsAuthedContextProvider></MockedProvider>
  ]
} as ComponentMeta<typeof HomeScreen>

const mocks = [
  {
    request: {
      query: MainUnauthedDocument,
    },
    result: {
      data: {
        __typename: "Query",
        globals: {
          __typename: "Globals",
          network: "mainnet"
        },
        btcPrice: {
          __typename: "Price",
          base: "USD",
          offset: 0,
          currencyUnit: "sats",
          formattedAmount: "0.00000020",
        },
        mobileVersions: {
          __typename: "PrMobileVersionsice",
          platform: "iOS",
          currentSupported: 100,
          minSupported: 100,
        }
      },
    },
  },
]

export const Default = () => 
  <HomeScreen />
