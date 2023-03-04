/* eslint-disable */

import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../.storybook/views"
import { TransactionDetailScreen } from "./transaction-detail-screen"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"

const route = {
  key: "transactionDetail",
  name: "transactionDetail",
  params: {
    txid: "63e685aeaa07c2f5296b9a06"
  },
} as const

storiesOf("Transaction Detail", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <MockedProvider mocks={mocks} cache={createCache()} >
        <UseCase text="Dollar" usage="The primary.">
          <TransactionDetailScreen route={route} />
        </UseCase>
      </MockedProvider>
    </Story>
  ))
