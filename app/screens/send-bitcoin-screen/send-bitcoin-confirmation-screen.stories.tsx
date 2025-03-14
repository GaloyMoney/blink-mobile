import React from "react"
import { Satoshis } from "lnurl-pay/dist/types/types"

import { MockedProvider } from "@apollo/client/testing"
import { DisplayCurrency, toUsdMoneyAmount } from "@app/types/amounts"
import { Meta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { WalletCurrency } from "../../graphql/generated"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import mocks from "../../graphql/mocks"
import { ConvertMoneyAmount } from "./payment-details/index.types"
import * as PaymentDetails from "./payment-details/intraledger"
import * as PaymentDetailsLightning from "./payment-details/lightning"
import SendBitcoinConfirmationScreen from "./send-bitcoin-confirmation-screen"

export default {
  title: "SendBitcoinConfirmationScreen",
  component: SendBitcoinConfirmationScreen,
  decorators: [
    (Story) => (
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <StoryScreen>{Story()}</StoryScreen>
        </MockedProvider>
      </IsAuthedContextProvider>
    ),
  ],
} as Meta<typeof SendBitcoinConfirmationScreen>

const btcSendingWalletDescriptor = {
  currency: WalletCurrency.Usd,
  id: "testwallet",
}

const convertMoneyAmountMock: ConvertMoneyAmount = (amount, currency) => {
  return {
    amount: amount.amount,
    currency,
    currencyCode: currency === DisplayCurrency ? "NGN" : currency,
  }
}

const testAmount = toUsdMoneyAmount(100)

const defaultParams: PaymentDetails.CreateIntraledgerPaymentDetailsParams<WalletCurrency> =
  {
    handle: "test",
    recipientWalletId: "testid",
    convertMoneyAmount: convertMoneyAmountMock,
    sendingWalletDescriptor: btcSendingWalletDescriptor,
    unitOfAccountAmount: testAmount,
  }

const { createIntraledgerPaymentDetails } = PaymentDetails
const paymentDetail = createIntraledgerPaymentDetails(defaultParams)

const route = {
  key: "sendBitcoinConfirmationScreen",
  name: "sendBitcoinConfirmation",
  params: {
    paymentDetail,
  },
} as const

export const Intraledger = () => <SendBitcoinConfirmationScreen route={route} />

const successActionMessageMock = {
  tag: "message",
  message: "Thank you for your support.",
  description: null,
  url: null,
  ciphertext: null,
  iv: null,
  decipher: () => null,
}

const lnUrlMock = {
  callback: "https://example.com/lnurl/callback",
  metadata: [["text/plain", "Pay to user@example.com"]],
  min: 1000 as Satoshis,
  max: 1000000 as Satoshis,
  fixed: false,
  metadataHash: "",
  identifier: "user@example.com",
  description: "Payment for services",
  image: "https://example.com/image.png",
  commentAllowed: 0,
  rawData: {},
}

const defaultLightningParams: PaymentDetailsLightning.CreateLnurlPaymentDetailsParams<WalletCurrency> =
  {
    lnurl: "lnurl1dp68gurn8ghj7mr...",
    lnurlParams: lnUrlMock,
    paymentRequest: "lnbc1m1psh8d8zpp5qk3z7t...",
    paymentRequestAmount: {
      currency: "BTC",
      currencyCode: "BTC",
      amount: 10000,
    },
    unitOfAccountAmount: {
      currency: "USD",
      amount: 5.0,
      currencyCode: "USD",
    },
    successAction: successActionMessageMock,
    convertMoneyAmount: convertMoneyAmountMock,
    sendingWalletDescriptor: btcSendingWalletDescriptor,
  }

const { createLnurlPaymentDetails } = PaymentDetailsLightning
const paymentDetailLightning = createLnurlPaymentDetails(defaultLightningParams)

const routeLightning = {
  key: "sendBitcoinConfirmationScreen",
  name: "sendBitcoinConfirmation",
  params: {
    paymentDetail: paymentDetailLightning,
  },
} as const

export const LightningLnURL = () => (
  <SendBitcoinConfirmationScreen route={routeLightning} />
)
