import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../../storybook/views"
import { GaloyCurrencyBubble } from "."
import { WalletCurrency } from "@app/types/amounts"
import { GaloyIcon } from "../galoy-icon"

storiesOf("Galoy Currency Bubble", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase style={{ flexDirection: "row" }} text="Medium">
        <GaloyCurrencyBubble size="medium" currency={WalletCurrency.BTC} />
        <GaloyCurrencyBubble size="medium" currency={WalletCurrency.USD} />
      </UseCase>
      <UseCase text="Large" style={{ flexDirection: "row" }}>
        <GaloyCurrencyBubble size="large" currency={WalletCurrency.BTC} />
        <GaloyCurrencyBubble size="large" currency={WalletCurrency.USD} />
      </UseCase>
    </Story>
  ))
