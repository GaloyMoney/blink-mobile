import * as React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { DefaultWalletScreen } from "./default-wallet"
import { Meta } from "@storybook/react"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { SetDefaultWalletScreenDocument } from "../../graphql/generated"

const mocksDefaultWallet = [
  {
    request: {
      query: SetDefaultWalletScreenDocument,
    },
    result: {
      data: {
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            defaultWalletId: "f79792e3-282b-45d4-85d5-7486d020def5",
            wallets: [
              {
                id: "f79792e3-282b-45d4-85d5-7486d020def5",
                walletCurrency: "BTC",
                balance: 88413,
                __typename: "BTCWallet",
              },
              {
                id: "f091c102-6277-4cc6-8d81-87ebf6aaad1b",
                walletCurrency: "USD",
                balance: 158,
                __typename: "UsdWallet",
              },
            ],
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
      },
    },
  },
]

export default {
  title: "DefaultWallet Screen",
  component: DefaultWalletScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof DefaultWalletScreen>

export const Default = () => (
  <MockedProvider mocks={[...mocksDefaultWallet]} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <DefaultWalletScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
