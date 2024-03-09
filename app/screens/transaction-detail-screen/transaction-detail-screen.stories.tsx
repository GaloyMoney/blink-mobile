import * as React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import { PersistentStateProvider } from "../../store/persistent-state"
import { TransactionDetailScreen } from "./transaction-detail-screen"

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

// FIXME: this doesn't work with useFragment

export const Default = () => (
  <PersistentStateProvider>
    <MockedProvider mocks={mocks} cache={createCache()}>
      <TransactionDetailScreen route={route} />
    </MockedProvider>
  </PersistentStateProvider>
)
