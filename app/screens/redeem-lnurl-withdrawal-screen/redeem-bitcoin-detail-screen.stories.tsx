import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import RedeemBitcoinDetailScreen from "./redeem-bitcoin-detail-screen"
import { Meta } from "@storybook/react"
import { StoryScreen } from "../../../.storybook/views"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"

export default {
  title: "Redeem bitcoin Detail",
  component: RedeemBitcoinDetailScreen,
  decorators: [
    (Story) => (
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <StoryScreen>{Story()}</StoryScreen>
        </MockedProvider>
      </IsAuthedContextProvider>
    ),
  ],
} as Meta<typeof RedeemBitcoinDetailScreen>

const validDestinationTemplate = {
  callback: "http://callback.com",
  domain: "domain",
  defaultDescription: "defaultDescription",
  k1: "k1",
}

const routeSetValue = {
  key: "redeemBitcoinDetail",
  name: "redeemBitcoinDetail",
  params: {
    receiveDestination: {
      validDestination: {
        ...validDestinationTemplate,
        maxWithdrawable: 10000000,
        minWithdrawable: 10000000,
      },
    },
  },
} as const

const routeDiffMinMax = {
  key: "redeemBitcoinDetail",
  name: "redeemBitcoinDetail",
  params: {
    receiveDestination: {
      validDestination: {
        ...validDestinationTemplate,
        maxWithdrawable: 10000000,
        minWithdrawable: 1000,
      },
    },
  },
} as const

export const SetValue = () => <RedeemBitcoinDetailScreen route={routeSetValue} />

export const DiffMinMax = () => <RedeemBitcoinDetailScreen route={routeDiffMinMax} />
