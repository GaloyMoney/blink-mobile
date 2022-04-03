import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { InMemoryCache } from "@apollo/client"
import { act, cleanup, fireEvent, render } from "@testing-library/react-native"
import "@testing-library/jest-native/extend-expect"
import "react-native-gesture-handler/jestSetup.js"

import { translateUnknown as translate } from "@galoymoney/client"
import "@mocks/react-native-firebase"
import "@mocks/react-navigation-native"
import { SendBitcoinScreen } from "@app/screens/send-bitcoin-screen"
import { waitForNextRender } from "../helpers/wait"
import { cachePrice, cacheWallet } from "../helpers/cache"

jest.mock("@app/utils/parsing", () => {
  const actualParsing = jest.requireActual("@app/utils/parsing")
  return {
    ...actualParsing,
    lightningInvoiceHasExpired: () => false,
  }
})

jest.mock("@app/utils/use-token", () => () => ({
  hasToken: true,
}))

const cache = new InMemoryCache()

describe("SendBitcoinScreen", () => {
  beforeEach(() => {
    cacheWallet(cache, 117585)
    cachePrice(cache)
  })
  afterEach(cleanup)

  it("render matches snapshot", () => {
    const tree = render(
      <MockedProvider cache={cache}>
        <SendBitcoinScreen route={{ params: null }} />
      </MockedProvider>,
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("has TextInputs", () => {
    const { queryByA11yLabel, queryByPlaceholderText } = render(
      <MockedProvider cache={cache}>
        <SendBitcoinScreen route={{ params: null }} />
      </MockedProvider>,
    )

    expect(queryByA11yLabel("Input payment")).not.toBeNull()
    expect(queryByPlaceholderText(translate("SendBitcoinScreen.input"))).not.toBeNull()
    expect(queryByPlaceholderText(translate("SendBitcoinScreen.note"))).not.toBeNull()
  })

  it("shows send only when an amount and destination are present", () => {
    const { getByA11yLabel, getByPlaceholderText, queryByText } = render(
      <MockedProvider cache={cache}>
        <SendBitcoinScreen route={{ params: null }} />
      </MockedProvider>,
    )

    const amountInput = getByA11yLabel("Input payment")
    const destinationInput = getByPlaceholderText(translate("SendBitcoinScreen.input"))

    expect(queryByText(translate("common.amountRequired"))).not.toBeNull()
    expect(queryByText(translate("common.usernameRequired"))).toBeNull()
    expect(queryByText(translate("common.send"))).toBeNull()

    fireEvent(amountInput, "onChangeText", "27226")

    expect(queryByText(translate("common.amountRequired"))).toBeNull()
    expect(queryByText(translate("common.usernameRequired"))).not.toBeNull()
    expect(queryByText(translate("common.send"))).toBeNull()

    fireEvent.changeText(destinationInput, "Bitcoin")

    expect(queryByText(translate("common.amountRequired"))).toBeNull()
    expect(queryByText(translate("common.usernameRequired"))).toBeNull()
    expect(queryByText(translate("common.send"))).not.toBeNull()
  })

  it("shows error when total exceeds the balance", () => {
    const { getByA11yLabel, queryByText } = render(
      <MockedProvider cache={cache}>
        <SendBitcoinScreen route={{ params: null }} />
      </MockedProvider>,
    )

    const amountInput = getByA11yLabel("Input payment")

    expect(
      queryByText(translate("SendBitcoinScreen.amountExceed", { balance: "$46.64" })),
    ).toBeNull()

    fireEvent(amountInput, "onChangeText", "27226")

    expect(
      queryByText(translate("SendBitcoinScreen.amountExceed", { balance: "$46.64" })),
    ).not.toBeNull()

    fireEvent(amountInput, "onChangeText", "2722")

    expect(
      queryByText(translate("SendBitcoinScreen.amountExceed", { balance: "$46.64" })),
    ).toBeNull()
  })

  it("successfully parses lightning payment with `lightning:` prefix", async () => {
    const { getByA11yLabel, getByPlaceholderText, queryByText } = render(
      <MockedProvider cache={cache}>
        <SendBitcoinScreen route={{ params: null }} />
      </MockedProvider>,
    )

    const displayText = getByA11yLabel("Input payment display value")
    const destinationInput = getByPlaceholderText(translate("SendBitcoinScreen.input"))

    fireEvent.changeText(
      destinationInput,
      "lightning:lnbc6864270n1p05zvjjpp5fpehvlv3dd2r76065r9v0l3n8qv9mfwu9ryhvpj5xsz3p4hy734qdzhxysv89eqyvmzqsnfw3pxcmmrddpx7mmdypp8yatwvd5zqmmwypqh2em4wd6zqvesyq5yyun4de3ksgz0dek8j2gcqzpgxqrrss6lqa5jllvuglw5tpsug4s2tmt5c8fnerr95fuh8htcsyx52cp3wzswj32xj5gewyfn7mg293v6jla9cz8zndhwdhcnnkul2qkf6pjlspj2nl3j",
    )

    await act(await waitForNextRender)
    expect(displayText).toHaveTextContent("272.26")

    expect(queryByText(translate("common.send"))).not.toBeNull()
  })
})
