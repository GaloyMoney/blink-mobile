import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import WalletOverview from "./wallet-overview"

declare let module

const noOp = () => {
  // do nothing
}

storiesOf("Wallet Overview", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
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
  ))
