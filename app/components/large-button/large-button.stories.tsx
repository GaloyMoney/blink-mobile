import { MockedProvider } from "@apollo/client/testing"
import { WalletCurrency } from "@app/graphql/generated"
import * as React from "react"
import { createCache } from "../../graphql/cache"
import { IconTransaction } from "../icon-transactions"
import { LargeButton } from "./large-button"

export default {
  title: "Large Button",
  decorators: [
    (Story) => (
      <MockedProvider mocks={[]} cache={createCache()}>
        {Story()}
      </MockedProvider>
    ),
  ],
}

export const Default = () => (
  <LargeButton
    icon={
      <IconTransaction
        isReceive={false}
        walletCurrency={WalletCurrency.BTC}
        pending={false}
        onChain={false}
      />
    }
    title="Open cash account"
  />
)
