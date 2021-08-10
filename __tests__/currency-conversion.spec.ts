import { currencyToText } from "../app/utils/currencyConversion"
import { CurrencyType } from "../app/utils/enum"

describe("currencyToText", () => {
  it("0", () => {
    const amount = "0"
    const currency = CurrencyType.USD

    const text = currencyToText(amount, currency)

    expect(text).toBe("0.00")
  })

  it("0.90", () => {
    const amount = "0.90"
    const currency = CurrencyType.USD

    const text = currencyToText(amount, currency)

    expect(text).toBe("0.90")
  })
})
