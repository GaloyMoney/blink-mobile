import { renderHook } from "@testing-library/react-hooks"

import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { MockedProvider } from "@apollo/client/testing"
import { PropsWithChildren } from "react"
import mocks from "@app/graphql/mocks"
import * as React from "react"
import { IsAuthedContextProvider } from "@app/graphql/is-authed-context"
import { CurrencyListDocument, RealtimePriceDocument } from "@app/graphql/generated"

describe("usePriceConversion", () => {
  describe("testing moneyAmountToMajorUnitOrSats", () => {
    it("with 0 digits", async () => {
      const mocksJpy = [
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
                      __typename: "PriceOfOneSat",
                    },
                    denominatorCurrency: "JPY",
                    id: "67b6e1d2-04c8-509a-abbd-b1cab08575d5",
                    timestamp: 1677184189,
                    usdCentPrice: {
                      base: 100000000,
                      offset: 6,
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
                  flag: "",
                  id: "JPY",
                  name: "Japanese Yen",
                  symbol: "¥",
                  fractionDigits: 0,
                  __typename: "Currency",
                },
              ],
            },
          },
        },
      ]

      const wrapper = ({ children }: PropsWithChildren) => (
        <IsAuthedContextProvider value={true}>
          <MockedProvider mocks={mocksJpy}>{children}</MockedProvider>
        </IsAuthedContextProvider>
      )
      const { result, waitForNextUpdate } = renderHook(() => useDisplayCurrency(), {
        wrapper,
      })

      await waitForNextUpdate()

      const res = result.current.moneyAmountToMajorUnitOrSats({
        amount: 100,
        currency: "DisplayCurrency",
      })

      expect(res).toBe(100)
    })

    it("with 2 digits", async () => {
      const wrapper = ({ children }: PropsWithChildren) => (
        <IsAuthedContextProvider value={true}>
          <MockedProvider mocks={mocks}>{children}</MockedProvider>
        </IsAuthedContextProvider>
      )
      const { result, waitForNextUpdate } = renderHook(() => useDisplayCurrency(), {
        wrapper,
      })

      await waitForNextUpdate()

      const res = result.current.moneyAmountToMajorUnitOrSats({
        amount: 10,
        currency: "DisplayCurrency",
      })

      expect(res).toBe(0.1)
    })
  })

  it("unAuthed should return default value", async () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <IsAuthedContextProvider value={false}>
        <MockedProvider mocks={[]}>{children}</MockedProvider>
      </IsAuthedContextProvider>
    )
    const { result } = renderHook(() => useDisplayCurrency(), {
      wrapper,
    })

    expect(result.current).toMatchObject({
      fractionDigits: 2,
      fiatSymbol: "$",
      displayCurrency: "USD",
    })
  })

  it("authed but empty query should return default value", async () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={[]}>{children}</MockedProvider>
      </IsAuthedContextProvider>
    )
    const { result, waitForNextUpdate } = renderHook(() => useDisplayCurrency(), {
      wrapper,
    })

    expect(result.current).toMatchObject({
      fractionDigits: 2,
      fiatSymbol: "$",
      displayCurrency: "USD",
    })

    await waitForNextUpdate()

    expect(result.current).toMatchObject({
      fractionDigits: 2,
      fiatSymbol: "$",
      displayCurrency: "USD",
    })
  })

  it("authed should return NGN from mock", async () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks}>{children}</MockedProvider>
      </IsAuthedContextProvider>
    )
    const { result, waitForNextUpdate } = renderHook(() => useDisplayCurrency(), {
      wrapper,
    })

    expect(result.current).toMatchObject({
      fractionDigits: 2,
      fiatSymbol: "$",
      displayCurrency: "USD",
    })

    await waitForNextUpdate()

    expect(result.current).toMatchObject({
      fractionDigits: 2,
      fiatSymbol: "₦",
      displayCurrency: "NGN",
    })
  })
})
