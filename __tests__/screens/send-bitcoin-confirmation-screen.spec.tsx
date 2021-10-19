import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { InMemoryCache } from "@apollo/client"
import { act, cleanup, fireEvent, render } from "@testing-library/react-native"
import "@testing-library/jest-native/extend-expect"
import "react-native-gesture-handler/jestSetup.js"

import { translate } from "@app/i18n/translate"
import "@mocks/react-native-firebase"
import "@mocks/react-navigation-native"
import {
  INTRA_LEDGER_PAY,
  LN_PAY,
  SendBitcoinConfirmationScreen,
} from "@app/screens/send-bitcoin-screen"
import { waitForNextRender } from "../helpers/wait"
import { cacheNodeStats, cachePrice, cacheWallet } from "../helpers/cache"
import { IPaymentType } from "@app/utils/parsing"

const payKeysendUsernameMocks = [
  {
    request: {
      query: INTRA_LEDGER_PAY,
      variables: {
        input: {
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
  userDefaultWalletId: "62af205a-298f-4448-bb31-4b424a27a4ee",
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
  userDefaultWalletId: null,
}

describe("SendBitcoinConfirmationScreen", () => {
  const cache = new InMemoryCache()
  cacheNodeStats(cache)
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
    const sendButton = getByText(
      translate("SendBitcoinConfirmationScreen.confirmPayment"),
    )
    fireEvent.press(sendButton)

    await act(await waitForNextRender)
    expect(queryByText(translate("SendBitcoinScreen.success"))).not.toBeNull()
  })
})
