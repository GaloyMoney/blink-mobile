import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../../storybook/views"
import { GaloyCurrencyBubble } from "."
import { WalletCurrency } from "@app/graphql/generated"

storiesOf("Galoy Currency Bubble", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase style={{ flexDirection: "row" }} text="Medium">
        <GaloyCurrencyBubble size="medium" currency={WalletCurrency.Btc} />
        <GaloyCurrencyBubble size="medium" currency={WalletCurrency.Usd} />
      </UseCase>
      <UseCase text="Large" style={{ flexDirection: "row" }}>
        <GaloyCurrencyBubble size="large" currency={WalletCurrency.Btc} />
        <GaloyCurrencyBubble size="large" currency={WalletCurrency.Usd} />
      </UseCase>
    </Story>
  ))
