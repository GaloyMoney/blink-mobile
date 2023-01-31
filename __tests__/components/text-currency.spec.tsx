import { MockedProvider } from "@apollo/client/testing"
import * as React from "react"
import { waitFor, render } from "@testing-library/react-native"
import { TextCurrencyForAmount } from "../../app/components/text-currency"
import { DisplayCurrencyDocument } from "../../app/graphql/generated"

const mocks = [
  {
    request: {
      query: DisplayCurrencyDocument,
    },
    result: {
      data: {
        __typename: "Query",
        me: {
          __typename: "User",
          id: "id1",
          defaultAccount: {
            __typename: "ConsumerAccount",
            id: "id2",
            displayCurrency: "EUR",
          },
        },
      },
    },
  },
]

describe("TextCurrencyForAmount", () => {
  it("renders the correct display currency for a given amount", async () => {
    const { findByText } = render(
      <MockedProvider mocks={mocks} addTypename={true}>
        <TextCurrencyForAmount amount={100} currency="display" style={{}} />
      </MockedProvider>,
    )
    await findByText("€100.00")
  })

  it("renders the correct USD currency for a given amount", async () => {
    const { findByText } = render(
      <MockedProvider mocks={mocks} addTypename={true}>
        <TextCurrencyForAmount amount={100} currency="USD" style={{}} />
      </MockedProvider>,
    )
    await findByText("$100.00")
  })

  it("renders the correct number of sats for BTC currency for a given amount", async () => {
    const { findByText } = render(
      <MockedProvider mocks={mocks} addTypename={true}>
        <TextCurrencyForAmount amount={100} currency="BTC" style={{}} satsIconSize={20} />
      </MockedProvider>,
    )
    await findByText("100 sats")
  })

  it("renders '...' when the amount is not a number", async () => {
    const { findByText } = render(
      <MockedProvider mocks={mocks} addTypename={true}>
        <TextCurrencyForAmount amount={NaN} currency="BTC" style={{}} satsIconSize={20} />
      </MockedProvider>,
    )
    await waitFor(() => findByText("..."))
  })
})
