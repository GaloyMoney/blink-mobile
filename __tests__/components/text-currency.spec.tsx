import { MockedProvider } from "@apollo/client/testing"
import * as React from "react"
import { render } from "@testing-library/react-native"
import { TextCurrencyForAmount } from "../../app/components/text-currency"
import { DisplayCurrencyDocument } from "../../app/graphql/generated"

const mocks = [
  {
    request: {
      query: DisplayCurrencyDocument,
    },
    result: {
      data: {
        me: {
          id: "id",
          defaultAccount: {
            id: "id",
            displayCurrency: "EUR",
          },
        },
      },
    },
  },
]

describe("TextCurrencyForAmount", () => {
  it.only("renders the correct display currency for a given amount", () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <TextCurrencyForAmount amount={100} currency="display" style={{}} />
      </MockedProvider>,
    )
    expect(getByText("100.00")).toBeDefined()
  })

  it("renders the correct USD currency for a given amount", () => {
    const { getByText } = render(
      <MockedProvider>
        <TextCurrencyForAmount amount={100} currency="USD" style={{}} />
      </MockedProvider>,
    )
    expect(getByText("$100.00")).toBeDefined()
  })

  it("renders the correct number of sats for BTC currency for a given amount", () => {
    const { getByText } = render(
      <MockedProvider>
        <TextCurrencyForAmount amount={100} currency="BTC" style={{}} satsIconSize={20} />
      </MockedProvider>,
    )
    expect(getByText("100 sats")).toBeDefined()
  })

  it("renders '...' when the amount is not a number", () => {
    const { getByText } = render(
      <MockedProvider>
        {" "}
        <TextCurrencyForAmount amount={NaN} currency="BTC" style={{}} satsIconSize={20} />
      </MockedProvider>,
    )
    expect(getByText("...")).toBeDefined()
  })
})
