import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { gql, InMemoryCache } from "@apollo/client"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react-native/pure"
import "@testing-library/jest-native/extend-expect"
import "../../node_modules/react-native-gesture-handler/jestSetup.js"

import "../../__mocks__/react-native-firebase"
import { SendBitcoinScreen } from "../../app/screens/send-bitcoin-screen"
import { QUERY_PRICE, WALLET } from "../../app/graphql/query"

jest.useFakeTimers()

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native")
  return {
    ...actualNav,
    useNavigation: () => ({
      addListener: jest.fn(),
      navigate: jest.fn(),
    }),
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
    description: "to dolcalmi",
    fee: 0,
    feeUsd: 0,
    hash: null,
    id: "60ff0fd95c95bd83528ad9b0",
    isReceive: false,
    pending: false,
    text: "-$0.0040",
    type: "on_us",
    usd: 0.003969998828125,
    username: "dolcalmi",
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
      username: "BitcoinBeachMarketing",
    },
  },
})

const mocks = []

afterEach(cleanup)

it("SendBitcoinScreen", async () => {
  const { getByPlaceholderText, getByText, queryByText } = render(
    <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
      <SendBitcoinScreen route={{ params: null }} />
    </MockedProvider>,
  )

  const amountInput = getByText("0.00")
  const destinationInput = getByPlaceholderText("username or invoice")
  const memoInput = getByPlaceholderText("optional note")
  const feeInput = getByPlaceholderText("network fee")

  expect(queryByText("Total exceeds your balance of $46.64")).toBeNull()
  fireEvent(destinationInput, "changeText", "100.00")
  // fireEvent(amountInput, 'onUpdateAmount', '100.00')
  // await waitFor(() => getByText('100.00'))
  // expect(destinationInput).toHaveTextContent("100.00")
})
