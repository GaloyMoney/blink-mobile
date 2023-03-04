import * as React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { IsAuthedContextProvider } from "@app/graphql/is-authed-context"
import { render, waitFor } from "@testing-library/react-native"

import { TextCurrencyForAmount } from "../../app/components/text-currency"
import { CurrencyListDocument, RealtimePriceDocument } from "../../app/graphql/generated"

const mocks = [
  {
    request: {
      query: RealtimePriceDocument,
    },
    result: {
      data: {
        me: {
          __typename: "User",
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            __typename: "Account",
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            realtimePrice: {
              btcSatPrice: {
                base: 24015009766,
                offset: 12,
                currencyUnit: "USDCENT",
                __typename: "PriceOfOneSat",
              },
              denominatorCurrency: "EUR",
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
            id: "EUR",
            name: "Euro",
            flag: "🇪🇺",
            symbol: "€",
            fractionDigits: 2,
          },
        ],
      },
    },
  },
]

describe("TextCurrencyForAmount", () => {
  it("renders the correct display currency for a given amount", async () => {
    const { findByText } = render(
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks} addTypename={true}>
          <TextCurrencyForAmount amount={100} currency="display" style={{}} />
        </MockedProvider>
      </IsAuthedContextProvider>,
    )
    await findByText("€100.00")
  })

  it("renders the correct USD currency for a given amount", async () => {
    const { findByText } = render(
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks} addTypename={true}>
          <TextCurrencyForAmount amount={100} currency="USD" style={{}} />
        </MockedProvider>
      </IsAuthedContextProvider>,
    )
    await findByText("$100.00")
  })

  it("renders the correct number of sats for BTC currency for a given amount", async () => {
    const { findByText } = render(
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks} addTypename={true}>
          <TextCurrencyForAmount
            amount={100}
            currency="BTC"
            style={{}}
            satsIconSize={20}
          />
        </MockedProvider>
      </IsAuthedContextProvider>,
    )
    await findByText("100 sats")
  })

  it("renders '...' when the amount is not a number", async () => {
    const { findByText } = render(
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks} addTypename={true}>
          <TextCurrencyForAmount
            amount={NaN}
            currency="BTC"
            style={{}}
            satsIconSize={20}
          />
        </MockedProvider>
      </IsAuthedContextProvider>,
    )
    await waitFor(() => findByText("..."))
  })
})
