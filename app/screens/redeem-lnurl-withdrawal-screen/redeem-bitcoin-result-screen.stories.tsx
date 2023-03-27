import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import { SetLightkMode } from "../../../.storybook/views/utils"
import RedeemBitcoinResultScreen from "./redeem-bitcoin-result-screen"
import { ComponentMeta } from "@storybook/react"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"

export default {
  title: "Redeem bitcoin Result",
  component: RedeemBitcoinResultScreen,
  decorators: [
    (Story) => (
      <IsAuthedContextProvider value={true}>
        <PersistentStateWrapper>
          <MockedProvider mocks={mocks} cache={createCache()}>
            <>
              <StoryScreen>{Story()}</StoryScreen>
              <SetLightkMode />
            </>
          </MockedProvider>
        </PersistentStateWrapper>
      </IsAuthedContextProvider>
    ),
  ],
} as ComponentMeta<typeof RedeemBitcoinResultScreen>

const route = {
  key: "redeemBitcoinResult",
  name: "redeemBitcoinResult",
  params: {
    callback: "http://callback.com",
    domain: "domain",
    // defaultDescription: "defaultDescription",
    k1: "k1",
    receivingWalletDescriptor: {
      id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
      currency: "BTC",
    },
    unitOfAccountAmount: {
      amount: 4000,
      currency: "BTC",
    },
    settlementAmount: {
      amount: 4000,
      currency: "BTC",
    },
    maxWithdrawable: 10000000,
    minWithdrawable: 1000,
  },
} as const

// TODO: need to mock fetch to be able to test this properly
export const Default = () => <RedeemBitcoinResultScreen route={route} />
