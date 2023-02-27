import { MockedProvider } from "@apollo/client/testing"
import { ComponentMeta } from "@storybook/react"
import React from "react"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import {
  CurrencyListDocument,
  DisplayCurrencyDocument,
  LnNoAmountInvoiceCreateDocument,
  RealtimePriceDocument,
  SendBitcoinDetailsScreenDocument,
  WalletCurrency,
} from "../../graphql/generated"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import SendBitcoinDetailsScreen from "./send-bitcoin-details-screen"
import { PaymentType } from "@galoymoney/client/dist/parsing-v2"

const mocks = [
  {
    request: {
      query: SendBitcoinDetailsScreenDocument,
    },
    result: {
      data: {
        globals: {
          __typename: "Globals",
          network: "mainnet",
        },
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            defaultWallet: {
              id: "f79792e3-282b-45d4-85d5-7486d020def5",
              walletCurrency: "BTC",
              __typename: "BTCWallet",
            },
            btcWallet: {
              __typename: "BTCWallet",
              id: "f091c102-6277-4cc6-8d81-87ebf6aaad1b",
              balance: 88413,
              displayBalance: 158,
            },
            usdWallet: {
              __typename: "UsdWallet",
              id: "f091c102-6277-4cc6-8d81-87ebf6aaad1b",
              balance: 158,
            },
            wallets: [
              {
                id: "f79792e3-282b-45d4-85d5-7486d020def5",
                balance: 88413,
                walletCurrency: "BTC",
                __typename: "BTCWallet",
              },
              {
                id: "f091c102-6277-4cc6-8d81-87ebf6aaad1b",
                balance: 158,
                walletCurrency: "USD",
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
  {
    request: {
      query: LnNoAmountInvoiceCreateDocument,
      variables: {
        input: { walletId: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8", memo: undefined },
      },
    },
    result: {
      data: {
        lnNoAmountInvoiceCreate: {
          invoice: {
            paymentRequest:
              "lnbc1p3lwh3npp5z5wkmy86gcww9u2h8tuekqmfz4pwlpkk4rfst8cm7jwzm8fklldsdqqcqzpuxqyz5vqsp52fv968tprd3dqkuqsq78nw8s0xr9zn7rx686ukq2rfnsdf27pwtq9qyyssqhc7m7d3gfvdsywx956d3u3h45xyf7xurc6yv5qxysspjnhhxstl3wet525ldxn3x6xd0g58nk6wuvwle0fhn5sul396za3qs5ma7zxsqjvklym",
            paymentHash:
              "0ab7a842956c260e1270a46d09e964ac15e0623d4f2d8d4b62af5a608f4c5e06",
            paymentSecret:
              "8c92e0f1db2374806ec11e8fea3d1513171bee9304dd54e33a4f2c0347b42006",
            __typename: "LnNoAmountInvoice",
          },
          errors: [],
          __typename: "LnNoAmountInvoicePayload",
        },
      },
    },
  },
  {
    request: {
      query: RealtimePriceDocument,
    },
    result: {
      data: {
        realtimePrice: {
          btcSatPrice: {
            base: 24015009766,
            offset: 12,
            currencyUnit: "USDCENT",
            __typename: "PriceOfOneSat",
          },
          denominatorCurrency: "USD",
          id: "67b6e1d2-04c8-509a-abbd-b1cab08575d5",
          timestamp: 1677184189,
          usdCentPrice: {
            base: 100000000,
            offset: 6,
            currencyUnit: "USDCENT",
            __typename: "PriceOfOneUsdCent",
          },
          __typename: "RealtimePrice",
        },
      },
    },
  },
  {
    request: {
      query: DisplayCurrencyDocument,
    },
    result: {
      data: {
        me: {
          __typename: "User",
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            __typename: "ConsumerAccount",
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            displayCurrency: "EUR",
          },
        },
      },
    },
  },
  {
    request: {
      query: CurrencyListDocument,
    },
    result: {
      data: {
        currencyList: [
          {
            __typename: "Currency",
            id: "USD",
            flag: "🇺🇸",
            name: "US Dollar",
            symbol: "$",
          },
          {
            __typename: "Currency",
            id: "EUR",
            flag: "🇪🇺",
            name: "Euro",
            symbol: "€",
          },
        ],
      },
    },
  },
]

export default {
  title: "SendBitcoinDetailsScreen",
  component: SendBitcoinDetailsScreen,
  decorators: [
    (Story) => (
      <PersistentStateWrapper>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <StoryScreen>{Story()}</StoryScreen>
        </MockedProvider>
      </PersistentStateWrapper>
    ),
  ],
} as ComponentMeta<typeof SendBitcoinDetailsScreen>

import {
  DestinationDirection,
  PaymentDestination,
  ResolvedIntraledgerPaymentDestination,
} from "./payment-destination/index.types"
import { createIntraledgerPaymentDetails } from "./payment-details"

const walletId = "f79792e3-282b-45d4-85d5-7486d020def5"
const handle = "test"

const validDestination: ResolvedIntraledgerPaymentDestination = {
  valid: true,
  walletId,
  paymentType: PaymentType.Intraledger,
  handle,
}

const createPaymentDetail = ({ convertPaymentAmount, sendingWalletDescriptor }) => {
  return createIntraledgerPaymentDetails({
    handle,
    recipientWalletId: walletId,
    sendingWalletDescriptor,
    convertPaymentAmount,
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
  createPaymentDetail,
}

const route = {
  key: "sendBitcoinDetailsScreen",
  name: "sendBitcoinDetails",
  params: {
    paymentDestination,
  },
} as const

export const Intraledger = () => (
  <IsAuthedContextProvider value={true}>
    <SendBitcoinDetailsScreen route={route} />
  </IsAuthedContextProvider>
)
