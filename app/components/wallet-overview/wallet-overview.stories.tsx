import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../.storybook/views"
import WalletOverview from "./wallet-overview"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"

declare let module

const noOp = () => {
  // do nothing
}

const mocks = []

storiesOf("Wallet Overview", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <MockedProvider mocks={mocks} cache={createCache()}>
      <Story>
        <UseCase text="USD" usage="The default.">
          <WalletOverview
            navigateToTransferScreen={noOp}
            btcWalletBalance={12345}
            btcWalletValueInUsd={100}
            usdWalletBalance={102}
          />
        </UseCase>
      </Story>
    </MockedProvider>
  ))
