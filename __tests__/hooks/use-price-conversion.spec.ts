import { renderHook } from "@testing-library/react-hooks"

type MockUseRealtimePriceResponse = Pick<ReturnType<typeof useRealtimePriceQuery>, "data">
const mockUseRealtimePriceQuery = jest.fn<
  MockUseRealtimePriceResponse,
  Parameters<typeof useRealtimePriceQuery>
>()
import { usePriceConversion } from "@app/hooks/use-price-conversion"
import { useRealtimePriceQuery, WalletCurrency } from "@app/graphql/generated"
import {
  BtcMoneyAmount,
  DisplayAmount,
  DisplayCurrency,
  UsdMoneyAmount,
} from "@app/types/amounts"

jest.mock("@app/graphql/generated", () => {
  return {
    ...jest.requireActual("@app/graphql/generated"),
    useRealtimePriceQuery: mockUseRealtimePriceQuery,
  }
})

const mockPriceData: MockUseRealtimePriceResponse = {
  data: {
    __typename: "Query",
    me: {
      id: "f2b1d23f-816c-51db-aea4-4b773cfdf7a7",
      __typename: "User",
      defaultAccount: {
        __typename: "ConsumerAccount",
        id: "f2b1d0bf-816c-51db-aea4-4b773cfdf7a7",
        realtimePrice: {
          __typename: "RealtimePrice",
          btcSatPrice: {
            __typename: "PriceOfOneSatInMinorUnit",
            base: 10118784000000,
            offset: 12,
          },
          denominatorCurrency: "NGN",
          id: "f2b1d0bf-816c-51db-aea4-4b773cfdf7a7",
          timestamp: 1678314952,
          usdCentPrice: {
            __typename: "PriceOfOneUsdCentInMinorUnit",
            base: 460434879,
            offset: 6,
          },
        },
      },
    },
  },
}

const oneThousandDollars: UsdMoneyAmount = {
  amount: 100000,
  currency: WalletCurrency.Usd,
} // $1,000
const oneThousandDollarsInSats: BtcMoneyAmount = {
  amount: 4550299,
  currency: WalletCurrency.Btc,
} // 4,550,299 sats
const oneThousandDollarsInNairaMinorUnits: DisplayAmount = {
  amount: 46043488,
  currency: DisplayCurrency,
} // 460,434.88 Naira

const amounts = {
  oneThousandDollars,
  oneThousandDollarsInSats,
  oneThousandDollarsInNairaMinorUnits,
}

describe("usePriceConversion", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should return null fields when no price is provided", () => {
    mockUseRealtimePriceQuery.mockReturnValue({ data: undefined })

    const { result } = renderHook(() => usePriceConversion())
    expect(result.current).toEqual({
      convertMoneyAmount: undefined,
      usdPerSat: null,
    })
  })

  describe("convertMoneyAmount", () => {
    mockUseRealtimePriceQuery.mockReturnValue(mockPriceData)

    const { result } = renderHook(() => usePriceConversion())
    const convertMoneyAmount = result.current.convertMoneyAmount
    if (!convertMoneyAmount) {
      throw new Error("convertMoneyAmount is undefined")
    }

    it("should make proper conversions", () => {
      // test all conversions
      for (const fromCurrency of Object.keys(amounts)) {
        for (const toCurrency of Object.keys(amounts)) {
          const fromAmount = amounts[fromCurrency as keyof typeof amounts]
          const toAmount = amounts[toCurrency as keyof typeof amounts]

          const convertedAmount = convertMoneyAmount(fromAmount, toAmount.currency)
          // expect amounts to be within .01% of each other due to rounding
          expect(
            (toAmount.amount - convertedAmount.amount) / convertedAmount.amount,
          ).toBeLessThan(0.0001)
        }
      }
    })

    it("should return input if the toCurrency is the same", () => {
      const amountsArray = Object.values(amounts)

      amountsArray.forEach((amount) => {
        expect(convertMoneyAmount(amount, amount.currency)).toBe(amount)
      })
    })
  })
})
