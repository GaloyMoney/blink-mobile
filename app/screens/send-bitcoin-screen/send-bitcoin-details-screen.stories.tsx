import { MockedProvider } from "@apollo/client/testing"
import { PaymentType } from "@galoymoney/client/dist/parsing-v2"
import { ComponentMeta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { WalletCurrency } from "../../graphql/generated"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import SendBitcoinDetailsScreen from "./send-bitcoin-details-screen"
import mocks from "../../graphql/mocks"
import {
  DestinationDirection,
  PaymentDestination,
  ResolvedIntraledgerPaymentDestination,
} from "./payment-destination/index.types"
import { createIntraledgerPaymentDetails } from "./payment-details"

export default {
  title: "SendBitcoinDetailsScreen",
  component: SendBitcoinDetailsScreen,
  decorators: [
    (Story) => (
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <StoryScreen>{Story()}</StoryScreen>
        </MockedProvider>
      </IsAuthedContextProvider>
    ),
  ],
} as ComponentMeta<typeof SendBitcoinDetailsScreen>

const walletId = "f79792e3-282b-45d4-85d5-7486d020def5"
const handle = "test"

const validDestination: ResolvedIntraledgerPaymentDestination = {
  valid: true,
  walletId,
  paymentType: PaymentType.Intraledger,
  handle,
}

/* eslint @typescript-eslint/ban-ts-comment: "off" */
// @ts-ignore-next-line no-implicit-any error
const createPaymentDetail = ({ convertMoneyAmount, sendingWalletDescriptor }) => {
  return createIntraledgerPaymentDetails({
    handle,
    recipientWalletId: walletId,
    sendingWalletDescriptor,
    convertMoneyAmount,
    unitOfAccountAmount: {
      amount: 0,
      currency: WalletCurrency.Btc,
    },
  })
}

const paymentDestination: PaymentDestination = {
  valid: true,
  validDestination,
  destinationDirection: DestinationDirection.Send,
  // @ts-ignore-next-line no-implicit-any error
  createPaymentDetail,
}

const route = {
  key: "sendBitcoinDetailsScreen",
  name: "sendBitcoinDetails",
  params: {
    paymentDestination,
  },
} as const

export const Intraledger = () => <SendBitcoinDetailsScreen route={route} />
