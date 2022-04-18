import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { InMemoryCache } from "@apollo/client"
import { act, cleanup, fireEvent, render } from "@testing-library/react-native"
import "@testing-library/jest-native/extend-expect"
import "react-native-gesture-handler/jestSetup.js"

import { translateUnknown as translate } from "@galoymoney/client"
import "@mocks/react-native-firebase"
import "@mocks/react-navigation-native"
import {
  INTRA_LEDGER_PAY,
  LN_PAY,
  LIGHTNING_FEES,
  SendBitcoinConfirmationScreen,
} from "@app/screens/send-bitcoin-screen"

import { waitForNextRender } from "../helpers/wait"
import { cachePrice, cacheWallet } from "../helpers/cache"
import { IPaymentType } from "@app/utils/parsing"

jest.mock("@app/utils/use-token", () => () => ({
  hasToken: true,
}))

const payKeysendUsernameMocks = [
  {
    request: {
      query: INTRA_LEDGER_PAY,
      variables: {
        input: {
          walletId: "8e8ed189-4da5-4729-b457-8ef9c069fa6a",
          recipientWalletId: "62af205a-298f-4448-bb31-4b424a27a4ee",
          amount: 68626,
          memo: null,
        },
      },
    },
    result: {
      data: {
        intraLedgerPaymentSend: {
          errors: [],
          status: "SUCCESS",
          __typename: "Invoice",
        },
      },
    },
  },
]

const lightningPayMocks = [
  {
    request: {
      query: LN_PAY,
      variables: {
        input: {
          walletId: "8e8ed189-4da5-4729-b457-8ef9c069fa6a",
          paymentRequest:
            "lnbc6864270n1p05zvjjpp5fpehvlv3dd2r76065r9v0l3n8qv9mfwu9ryhvpj5xsz3p4hy734qdzhxysv89eqyvmzqsnfw3pxcmmrddpx7mmdypp8yatwvd5zqmmwypqh2em4wd6zqvesyq5yyun4de3ksgz0dek8j2gcqzpgxqrrss6lqa5jllvuglw5tpsug4s2tmt5c8fnerr95fuh8htcsyx52cp3wzswj32xj5gewyfn7mg293v6jla9cz8zndhwdhcnnkul2qkf6pjlspj2nl3j",
          memo: null,
        },
      },
    },
    result: {
      data: {
        lnInvoicePaymentSend: {
          errors: [],
          status: "SUCCESS",
          __typename: "Invoice",
        },
      },
    },
  },
  {
    request: {
      query: LIGHTNING_FEES,
      variables: {
        input: {
          walletId: "8e8ed189-4da5-4729-b457-8ef9c069fa6a",
          paymentRequest:
            "lnbc6864270n1p05zvjjpp5fpehvlv3dd2r76065r9v0l3n8qv9mfwu9ryhvpj5xsz3p4hy734qdzhxysv89eqyvmzqsnfw3pxcmmrddpx7mmdypp8yatwvd5zqmmwypqh2em4wd6zqvesyq5yyun4de3ksgz0dek8j2gcqzpgxqrrss6lqa5jllvuglw5tpsug4s2tmt5c8fnerr95fuh8htcsyx52cp3wzswj32xj5gewyfn7mg293v6jla9cz8zndhwdhcnnkul2qkf6pjlspj2nl3j",
        },
      },
    },
    result: {
      data: {
        lnInvoiceFeeProbe: {
          errors: [],
          amount: 0,
          __typename: "InvoiceFee",
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
  primaryCurrency: "BTC" as CurrencyType,
  referenceAmount: usernameSatAmount,
  sameNode: null,
  username: "Bitcoin",
  recipientDefaultWalletId: "62af205a-298f-4448-bb31-4b424a27a4ee",
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
  primaryCurrency: "BTC" as CurrencyType,
  referenceAmount: lightningSatAmount,
  sameNode: false,
  username: null,
  recipientDefaultWalletId: null,
}

describe("SendBitcoinConfirmationScreen", () => {
  const cache = new InMemoryCache()

  cachePrice(cache)
  afterEach(cleanup)

  it("render matches snapshot", () => {
    cacheWallet(cache, 1175855)
    const tree = render(
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
    ).toJSON()
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

  it("successfully sends payment by intraLedgerPaymentSend", async () => {
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
    await act(await waitForNextRender)
    const sendButton = getByText(
      translate("SendBitcoinConfirmationScreen.confirmPayment"),
    )
    fireEvent.press(sendButton)

    await act(await waitForNextRender)
    expect(queryByText(translate("SendBitcoinScreen.success"))).not.toBeNull()
  })

  it("successfully sends lightning payment with `lightning:` prefix and amount", async () => {
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
    await act(await waitForNextRender)
    const sendButton = getByText(
      translate("SendBitcoinConfirmationScreen.confirmPayment"),
    )
    fireEvent.press(sendButton)

    await act(await waitForNextRender)
    expect(queryByText(translate("SendBitcoinScreen.success"))).not.toBeNull()
  })
})
