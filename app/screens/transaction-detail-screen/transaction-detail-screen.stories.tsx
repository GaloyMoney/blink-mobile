import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import { TransactionDetailScreen } from "./transaction-detail-screen"
import { ComponentMeta } from "@storybook/react"

export default {
  title: "Transaction Detail",
  component: TransactionDetailScreen,
} as ComponentMeta<typeof TransactionDetailScreen>

const route = {
  key: "transactionDetail",
  name: "transactionDetail",
  params: {
    txid: "63e685aeaa07c2f5296b9a06",
  },
} as const

export const TransactionDetail = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <TransactionDetailScreen route={route} />
  </MockedProvider>
)
