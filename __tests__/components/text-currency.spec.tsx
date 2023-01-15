/* eslint-disable no-empty-function */
import * as React from "react"
import { render } from "@testing-library/react-native"
import { TextCurrencyForAmount } from "../../app/components/text-currency"
import { LocalizationContext } from "../../app/store/localization-context"

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = {
    displayCurrency: "EUR",
    setDisplayCurrency: () => {},
  }
  return (
    <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>
  )
}

describe("TextCurrencyForAmount", () => {
  it("renders the correct display currency for a given amount", () => {
    const { getByText } = render(
      <TestWrapper>
        <TextCurrencyForAmount amount={100} currency="display" style={{}} />
      </TestWrapper>,
    )
    expect(getByText("€100.00")).toBeDefined()
  })

  it("renders the correct USD currency for a given amount", () => {
    const { getByText } = render(
      <TestWrapper>
        <TextCurrencyForAmount amount={100} currency="USD" style={{}} />
      </TestWrapper>,
    )
    expect(getByText("$100.00")).toBeDefined()
  })

  it("renders the correct number of sats for BTC currency for a given amount", () => {
    const { getByText } = render(
      <TestWrapper>
        <TextCurrencyForAmount amount={100} currency="BTC" style={{}} satsIconSize={20} />
      </TestWrapper>,
    )
    expect(getByText("100 sats")).toBeDefined()
  })

  it("renders '...' when the amount is not a number", () => {
    const { getByText } = render(
      <TestWrapper>
        {" "}
        <TextCurrencyForAmount amount={NaN} currency="BTC" style={{}} satsIconSize={20} />
      </TestWrapper>,
    )
    expect(getByText("...")).toBeDefined()
  })
})
