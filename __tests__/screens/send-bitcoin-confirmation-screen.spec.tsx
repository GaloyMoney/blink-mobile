import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { InMemoryCache } from "@apollo/client"
import { act, cleanup, fireEvent, render } from "@testing-library/react-native"
import renderer from "react-test-renderer"
import "@testing-library/jest-native/extend-expect"
import "@node_modules/react-native-gesture-handler/jestSetup.js"

import { translate } from "@app/i18n/translate"
import "@mocks/react-native-firebase"
import "@mocks/react-navigation-native"
import {
  LIGHTNING_PAY,
  PAY_KEYSEND_USERNAME,
  SendBitcoinConfirmationScreen,
} from "@app/screens/send-bitcoin-screen"
import { waitForNextRender } from "../helpers/wait"
import { cacheNodeStats, cachePrice, cacheWallet } from "../helpers/cache"
import { IPaymentType } from "@app/utils/parsing"

const payKeysendUsernameMocks = [
  {
    request: {
      query: PAY_KEYSEND_USERNAME,
      variables: {
        amount: 68626,
        destination: "",
        username: "Bitcoin",
        memo: null,
      },
    },
    result: {
      data: {
        invoice: {
          payKeysendUsername: "success",
          __typename: "Invoice",
        },
      },
    },
  },
]

const lightningPayMocks = [
  {
    request: {
      query: LIGHTNING_PAY,
      variables: {
        invoice:
          "lnbc6864270n1p05zvjjpp5fpehvlv3dd2r76065r9v0l3n8qv9mfwu9ryhvpj5xsz3p4hy734qdzhxysv89eqyvmzqsnfw3pxcmmrddpx7mmdypp8yatwvd5zqmmwypqh2em4wd6zqvesyq5yyun4de3ksgz0dek8j2gcqzpgxqrrss6lqa5jllvuglw5tpsug4s2tmt5c8fnerr95fuh8htcsyx52cp3wzswj32xj5gewyfn7mg293v6jla9cz8zndhwdhcnnkul2qkf6pjlspj2nl3j",
        memo: null,
      },
    },
    result: {
      data: {
        invoice: {
          payInvoice: "success",
          __typename: "Invoice",
        },
      },
    },
  },
]

const usernameSatAmount: MoneyAmount = {
  value: 68626,
  currency: "BTC",
}

const usernameRouteParams = {
  address: null,
  amountless: false,
  invoice: null,
  memo: null,
  paymentType: "username" as IPaymentType,
  prefCurrency: "BTC" as CurrencyType,
  primaryAmount: usernameSatAmount,
  sameNode: null,
  username: "Bitcoin",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mNavigation: any = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  pop: jest.fn(),
}

const lightningSatAmount: MoneyAmount = {
  value: 686427,
  currency: "BTC",
}

const lightningRouteParams = {
  address: null,
  amountless: false,
  invoice:
    "lnbc6864270n1p05zvjjpp5fpehvlv3dd2r76065r9v0l3n8qv9mfwu9ryhvpj5xsz3p4hy734qdzhxysv89eqyvmzqsnfw3pxcmmrddpx7mmdypp8yatwvd5zqmmwypqh2em4wd6zqvesyq5yyun4de3ksgz0dek8j2gcqzpgxqrrss6lqa5jllvuglw5tpsug4s2tmt5c8fnerr95fuh8htcsyx52cp3wzswj32xj5gewyfn7mg293v6jla9cz8zndhwdhcnnkul2qkf6pjlspj2nl3j",
  memo: null,
  paymentType: "lightning" as IPaymentType,
  prefCurrency: "BTC" as CurrencyType,
  primaryAmount: lightningSatAmount,
  sameNode: false,
  username: null,
}

afterEach(cleanup)

describe("SendBitcoinConfirmationScreen", () => {
  const cache = new InMemoryCache()
  cacheNodeStats(cache)
  cachePrice(cache)

  it("render matches snapshot", () => {
    cacheWallet(cache, 1175855)
    const tree = renderer
      .create(
        <MockedProvider cache={cache}>
          <SendBitcoinConfirmationScreen
            navigation={mNavigation}
            route={{
              key: "",
              name: "sendBitcoinConfirmation",
              params: usernameRouteParams,
            }}
          />
        </MockedProvider>,
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("does not send payment when total exceeds the balance", async () => {
    cacheWallet(cache, 5855)
    const { queryByText } = render(
      <MockedProvider mocks={payKeysendUsernameMocks} cache={cache}>
        <SendBitcoinConfirmationScreen
          navigation={mNavigation}
          route={{
            key: "",
            name: "sendBitcoinConfirmation",
            params: usernameRouteParams,
          }}
        />
      </MockedProvider>,
    )

    expect(
      queryByText(translate("SendBitcoinConfirmationScreen.confirmPayment")),
    ).toBeNull()
  })

  it("successfully sends payment by payKeysendUsername", async () => {
    cacheWallet(cache, 1175855)
    const { getByText, queryByText } = render(
      <MockedProvider mocks={payKeysendUsernameMocks} cache={cache}>
        <SendBitcoinConfirmationScreen
          navigation={mNavigation}
          route={{
            key: "",
            name: "sendBitcoinConfirmation",
            params: usernameRouteParams,
          }}
        />
      </MockedProvider>,
    )

    const sendButton = getByText(
      translate("SendBitcoinConfirmationScreen.confirmPayment"),
    )
    fireEvent.press(sendButton)

    await act(await waitForNextRender)
    expect(queryByText(translate("SendBitcoinScreen.success"))).not.toBeNull()
  })

  it("successfully sends lightning payment with `lightning:` prefix", async () => {
    cacheWallet(cache, 1175855)
    const { getByText, queryByText } = render(
      <MockedProvider mocks={lightningPayMocks} cache={cache}>
        <SendBitcoinConfirmationScreen
          navigation={mNavigation}
          route={{
            key: "",
            name: "sendBitcoinConfirmation",
            params: lightningRouteParams,
          }}
        />
      </MockedProvider>,
    )
    const sendButton = getByText(
      translate("SendBitcoinConfirmationScreen.confirmPayment"),
    )
    fireEvent.press(sendButton)

    await act(await waitForNextRender)
    expect(queryByText(translate("SendBitcoinScreen.success"))).not.toBeNull()
  })
})
