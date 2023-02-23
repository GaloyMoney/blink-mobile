import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../.storybook/views"
import { WalletSummary } from "./wallet-summary"
import { WalletCurrency } from "@app/utils/enum"
import { MockedProvider } from "@apollo/client/testing"

declare let module

storiesOf("Wallet Summary", module)
  .addDecorator((fn) => (
    <MockedProvider>
      <StoryScreen>{fn()}</StoryScreen>
    </MockedProvider>
  ))
  .add("Style Presets", () => (
    <Story>
      <UseCase text="BTC" usage="The default.">
        <WalletSummary
          amountType="SEND"
          walletCurrency={WalletCurrency.BTC}
          usdBalanceInDollars={129.2}
          btcBalanceInSats={2000}
        />
      </UseCase>
      <UseCase text="USD" usage="The default.">
        <WalletSummary
          amountType="SEND"
          walletCurrency={WalletCurrency.USD}
          usdBalanceInDollars={129.2}
        />
      </UseCase>
    </Story>
  ))
