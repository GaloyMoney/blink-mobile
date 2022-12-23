/* eslint-disable no-empty-function */
import React from "react"
import { render, fireEvent } from "@testing-library/react-native"
import { CurrencyInput } from "../../app/components/currency-input"

describe("CurrencyInput", () => {
  it("displays the correct currency symbol based on the currencyType prop - $", () => {
    const { getByTestId } = render(
      <CurrencyInput currencyType="USD" onValueChange={() => {}} />,
    )
    const input = getByTestId("currency-input")
    expect(input.props.value).toBe("$0.00")
  })

  it("displays the correct currency symbol based on the currencyType prop - €", () => {
    const { getByTestId } = render(
      <CurrencyInput currencyType="EUR" onValueChange={() => {}} />,
    )
    const input = getByTestId("currency-input")
    expect(input.props.value).toBe("€0.00")
  })

  it("supports minor currency units (cents)", () => {
    const { getByTestId } = render(
      <CurrencyInput currencyType="USD" onValueChange={() => {}} />,
    )
    const input = getByTestId("currency-input")
    fireEvent.changeText(input, "12")
    expect(input.props.value).toBe("$0.12")
  })

  it("formats the input value with commas as thousand separators", () => {
    const { getByTestId } = render(
      <CurrencyInput currencyType="USD" onValueChange={() => {}} />,
    )
    const input = getByTestId("currency-input")
    fireEvent.changeText(input, "12345600")
    expect(input.props.value).toBe("$123,456.00")
  })

  it("strips out non-numeric characters from the input value", () => {
    const { getByTestId } = render(
      <CurrencyInput currencyType="USD" onValueChange={() => {}} />,
    )
    const input = getByTestId("currency-input")
    fireEvent.changeText(input, "$123,456a789b0c00")
    expect(input.props.value).toBe("$1,234,567,890.00")
  })

  it("calls the onValueChange prop with the numeric value of the input", () => {
    const onValueChange = jest.fn()
    const { getByTestId } = render(
      <CurrencyInput currencyType="USD" onValueChange={onValueChange} />,
    )
    const input = getByTestId("currency-input")
    fireEvent.changeText(input, "$123,456a789b0c")
    expect(onValueChange).toHaveBeenCalledWith(1234567890)
  })
})
