import {
  getMatchingCurrencies,
  wordMatchesCurrency,
} from "../../app/screens/settings-screen/display-currency-screen"

const currency = {
  flag: "🇹🇹",
  id: "TTD",
  name: "Trinidad and Tobago Dollar",
  symbol: "TT$",
  __typename: "Currency",
} as const

const currencies = [
  {
    flag: "🇹🇹",
    id: "TTD",
    name: "Trinidad and Tobago Dollar",
    symbol: "TT$",
    __typename: "Currency",
  } as const,
  {
    flag: "🇹🇷",
    id: "TRY",
    name: "Turkish Lira",
    symbol: "₤",
    __typename: "Currency",
  } as const,
  {
    flag: "🇮🇳",
    id: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    __typename: "Currency",
  } as const,
  {
    flag: "🇺🇸",
    id: "USD",
    name: "US Dollar",
    symbol: "$",
    __typename: "Currency",
  } as const,
]

describe("match-currencies", () => {
  it("wordMatchesCurrency", () => {
    expect(wordMatchesCurrency("TTD", currency)).toBe(true)
    expect(wordMatchesCurrency("ttd", currency)).toBe(true)
    expect(wordMatchesCurrency("dollar", currency)).toBe(true)
    expect(wordMatchesCurrency("toba", currency)).toBe(true)
    expect(wordMatchesCurrency("Trini", currency)).toBe(true)

    expect(wordMatchesCurrency("US", currency)).toBe(false)
    expect(wordMatchesCurrency("USD", currency)).toBe(false)
    expect(wordMatchesCurrency("usd", currency)).toBe(false)
  })

  it("getMatchingCurrencies", () => {
    expect(getMatchingCurrencies("EUR", currencies.slice())).toEqual([])
    expect(getMatchingCurrencies("USD", currencies.slice())).toEqual([
      {
        flag: "🇺🇸",
        id: "USD",
        name: "US Dollar",
        symbol: "$",
        __typename: "Currency",
      },
    ])
    expect(getMatchingCurrencies("dollar", currencies.slice())).toEqual([
      {
        flag: "🇹🇹",
        id: "TTD",
        name: "Trinidad and Tobago Dollar",
        symbol: "TT$",
        __typename: "Currency",
      },
      {
        flag: "🇺🇸",
        id: "USD",
        name: "US Dollar",
        symbol: "$",
        __typename: "Currency",
      },
    ])
  })
})
