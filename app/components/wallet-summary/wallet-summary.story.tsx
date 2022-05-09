import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import {WalletSummary} from "./wallet-summary"
import { WalletType } from "@app/utils/enum"

declare let module

storiesOf("Wallet Summary", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="BTC" usage="The default.">
        <WalletSummary amountType="SEND" walletType={WalletType.BTC} usdBalanceInDollars={129.2} btcBalanceInSats={2000}/>
      </UseCase>
      <UseCase text="USD" usage="The default.">
        <WalletSummary walletType={WalletType.USD} usdBalanceInDollars={129.2}/>
      </UseCase>
    </Story>
  ))
