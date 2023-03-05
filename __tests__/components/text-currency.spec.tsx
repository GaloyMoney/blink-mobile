import { MockedProvider } from "@apollo/client/testing"
import { act, render } from "@testing-library/react-native"
import * as React from "react"
import { TextCurrencyForAmount } from "../../app/components/text-currency"

import { IsAuthedContextProvider } from "@app/graphql/is-authed-context"
import mocks from "@app/graphql/mocks"
import { createCache } from "@app/graphql/cache"

describe("TextCurrencyForAmount", () => {
  it("renders the correct display currency for a given amount", async () => {
    const { findByText } = render(
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <TextCurrencyForAmount amount={100} currency="display" style={{}} />
        </MockedProvider>
      </IsAuthedContextProvider>,
    )
    await act(async () => {
      await findByText("₦100.00")
    })
  })

  it("renders the correct USD currency for a given amount", async () => {
    const { findByText } = render(
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <TextCurrencyForAmount amount={100} currency="USD" style={{}} />
        </MockedProvider>
      </IsAuthedContextProvider>,
    )
    await act(async () => {
      await findByText("$100.00")
    })
  })

  it("renders the correct number of sats for BTC currency for a given amount", async () => {
    const { findByText } = render(
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <TextCurrencyForAmount
            amount={100}
            currency="BTC"
            style={{}}
            satsIconSize={20}
          />
        </MockedProvider>
      </IsAuthedContextProvider>,
    )
    await act(async () => {
      await findByText("100 sats")
    })
  })

  it("renders '...' when the amount is not a number", async () => {
    const { findByText } = render(
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <TextCurrencyForAmount
            amount={NaN}
            currency="BTC"
            style={{}}
            satsIconSize={20}
          />
        </MockedProvider>
      </IsAuthedContextProvider>,
    )
    await act(async () => {
      await findByText("...")
    })
  })
})
