import { MockedProvider } from "@apollo/client/testing"
import { ComponentMeta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import mocks from "../../graphql/mocks"
import WalletOverview from "./wallet-overview"

export default {
  title: "Wallet Overview",
  component: WalletOverview,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as ComponentMeta<typeof WalletOverview>

export const Default = () => (
  <IsAuthedContextProvider value={true}>
    <WalletOverview
      btcWalletBalance={12345}
      btcWalletValueInDisplayCurrency={100}
      usdWalletBalanceInDisplayCurrency={102}
    />
  </IsAuthedContextProvider>
)
