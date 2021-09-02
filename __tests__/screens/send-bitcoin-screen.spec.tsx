import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { gql, InMemoryCache } from "@apollo/client"
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
  SendBitcoinScreen,
} from "@app/screens/send-bitcoin-screen"
import { QUERY_PRICE, WALLET } from "@app/graphql/query"
import { waitForNextRender } from "../helpers/wait"

jest.mock("../../app/utils/parsing", () => {
  const actualParsing = jest.requireActual("../../app/utils/parsing")
  return {
    ...actualParsing,
    lightningInvoiceHasExpired: () => false,
  }
})

const transactions = [
  {
    __typename: "Transaction",
    amount: -70,
    created_at: 1628021570,
    date: "2021-08-03T20:12:50.000Z",
    date_format: "Tue Aug 03 2021 15:12:50 GMT-0500",
    date_nice_print: "hace 21 horas",
    description: "Add a comment",
    fee: 1,
    feeUsd: 0.0003797510546875,
    hash: "e982613a64e410d65f60fd3fd10d704e100b3c390f99c58f787dad9e6e748135",
    id: "6109a34204b9a6f81c74c7d7",
    isReceive: false,
    pending: false,
    text: "-$0.03",
    type: "payment",
    usd: 0.026582573828124997,
    username: null,
  },
  {
    __typename: "Transaction",
    amount: -10,
    created_at: 1627328473,
    date: "2021-07-26T19:41:13.000Z",
    date_format: "Mon Jul 26 2021 14:41:13 GMT-0500",
    date_nice_print: "hace 9 días",
    description: "to Bitcoin",
    fee: 0,
    feeUsd: 0,
    hash: null,
    id: "60ff0fd95c95bd83528ad9b0",
    isReceive: false,
    pending: false,
    text: "-$0.0040",
    type: "on_us",
    usd: 0.003969998828125,
    username: "Bitcoin",
  },
  {
    __typename: "Transaction",
    amount: 1,
    created_at: 1623602166,
    date: "2021-06-13T16:36:06.000Z",
    date_format: "Sun Jun 13 2021 11:36:06 GMT-0500",
    date_nice_print: "hace 2 meses",
    description: "whatIsBitcoin",
    fee: 0,
    feeUsd: 0,
    hash: "a73651e6b7612f80ad2ff2676d1bf788218e95bce3d2cdf4e57cb5379e6592b1",
    id: "60c633f6c6fbba6d6c74b352",
    isReceive: true,
    pending: false,
    text: "$0.0004",
    type: "on_us",
    usd: 0.0003693000390625,
    username: "BitcoinBeachMarketing",
  },
]

const cache = new InMemoryCache()
cache.writeQuery({
  query: WALLET,
  data: {
    wallet: [
      {
        __typename: "Wallet",
        balance: 117585,
        currency: "BTC",
        id: "BTC",
        transactions: transactions,
      },
    ],
  },
})

cache.writeQuery({
  query: gql`
    query nodeStats {
      nodeStats {
        id
      }
    }
  `,
  data: {
    nodeStats: {
      __typename: "NodeStats",
      id: "",
    },
  },
})

cache.writeQuery({
  query: QUERY_PRICE,
  data: {
    prices: [
      {
        __typename: "Price",
        id: "1628106059",
        o: 0.0003966375,
      },
    ],
  },
})

cache.writeQuery({
  query: gql`
    query username {
      me {
        username
      }
    }
  `,
  data: {
    me: {
      username: "BitcoinBeach",
    },
  },
})

const payKeysendUsernameMocks = [
  {
    request: {
      query: PAY_KEYSEND_USERNAME,
      variables: {
        amount: 68626,
        destination: "",
        username: "Bitcoin",
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

afterEach(cleanup)

describe("SendBitcoinScreen", () => {
  it("render matches snapshot", () => {
    const tree = renderer
      .create(
        <MockedProvider cache={cache}>
          <SendBitcoinScreen route={{ params: null }} />
        </MockedProvider>,
      )
      .toJSON()
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
    expect(queryByPlaceholderText(translate("SendBitcoinScreen.fee"))).not.toBeNull()
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
      queryByText(translate("SendBitcoinScreen.totalExceed", { balance: "$46.64" })),
    ).toBeNull()

    fireEvent(amountInput, "onChangeText", "27226")

    expect(
      queryByText(translate("SendBitcoinScreen.totalExceed", { balance: "$46.64" })),
    ).not.toBeNull()

    fireEvent(amountInput, "onChangeText", "2722")

    expect(
      queryByText(translate("SendBitcoinScreen.totalExceed", { balance: "$46.64" })),
    ).toBeNull()
  })

  it("does not send payment when total exceeds the balance", async () => {
    const { getByA11yLabel, getByPlaceholderText, getByText, queryByText } = render(
      <MockedProvider mocks={payKeysendUsernameMocks} cache={cache}>
        <SendBitcoinScreen route={{ params: null }} />
      </MockedProvider>,
    )

    const amountInput = getByA11yLabel("Input payment")
    const destinationInput = getByPlaceholderText(translate("SendBitcoinScreen.input"))

    fireEvent.changeText(destinationInput, "Bitcoin")
    fireEvent(amountInput, "onChangeText", "27226")

    const sendButton = getByText(translate("common.send"))
    fireEvent.press(sendButton)

    await act(await waitForNextRender)
    expect(queryByText(translate("SendBitcoinScreen.success"))).toBeNull()
  })

  it("successfully sends payment by payKeysendUsername", async () => {
    const { getByA11yLabel, getByPlaceholderText, getByText, queryByText } = render(
      <MockedProvider mocks={payKeysendUsernameMocks} cache={cache}>
        <SendBitcoinScreen route={{ params: null }} />
      </MockedProvider>,
    )

    const amountInput = getByA11yLabel("Input payment")
    const destinationInput = getByPlaceholderText(translate("SendBitcoinScreen.input"))

    fireEvent.changeText(destinationInput, "Bitcoin")
    fireEvent(amountInput, "onChangeText", "2722")

    const sendButton = getByText(translate("common.send"))
    fireEvent.press(sendButton)

    await act(await waitForNextRender)
    expect(queryByText(translate("SendBitcoinScreen.success"))).not.toBeNull()
  })

  it.skip("successfully sends lightning payment with `lightning:` prefix", async () => {
    cache.writeQuery({
      query: WALLET,
      data: {
        wallet: [
          {
            __typename: "Wallet",
            balance: 1175855,
            currency: "BTC",
            id: "BTC",
            transactions: transactions,
          },
        ],
      },
    })

    const lightningPayMocks = [
      {
        request: {
          query: LIGHTNING_PAY,
          variables: {
            invoice:
              "lnbc6864270n1p05zvjjpp5fpehvlv3dd2r76065r9v0l3n8qv9mfwu9ryhvpj5xsz3p4hy734qdzhxysv89eqyvmzqsnfw3pxcmmrddpx7mmdypp8yatwvd5zqmmwypqh2em4wd6zqvesyq5yyun4de3ksgz0dek8j2gcqzpgxqrrss6lqa5jllvuglw5tpsug4s2tmt5c8fnerr95fuh8htcsyx52cp3wzswj32xj5gewyfn7mg293v6jla9cz8zndhwdhcnnkul2qkf6pjlspj2nl3j",
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

    const { getByA11yLabel, getByPlaceholderText, getByText, queryByText } = render(
      <MockedProvider mocks={lightningPayMocks} cache={cache}>
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

    const sendButton = getByText(translate("common.send"))
    fireEvent.press(sendButton)

    await act(await waitForNextRender)
    expect(queryByText(translate("SendBitcoinScreen.success"))).not.toBeNull()
  })
})
