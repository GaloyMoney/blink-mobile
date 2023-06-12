import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import { TransactionDetailScreen } from "./transaction-detail-screen"
import { Meta } from "@storybook/react"
import { PersistentStateProvider } from "../../store/persistent-state"

export default {
  title: "Transaction Detail",
  component: TransactionDetailScreen,
} as Meta<typeof TransactionDetailScreen>

const route = {
  key: "transactionDetail",
  name: "transactionDetail",
  params: {
    txid: "6405acd835ff0f9111e86267",
  },
} as const

// FIXME: this doesn't work with useFragment_experimental

export const Default = () => (
  <PersistentStateProvider>
    <MockedProvider mocks={mocks} cache={createCache()}>
      <TransactionDetailScreen route={route} />
    </MockedProvider>
  </PersistentStateProvider>
)
