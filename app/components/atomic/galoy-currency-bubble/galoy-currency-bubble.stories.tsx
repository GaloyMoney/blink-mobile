import React from "react"

import { WalletCurrency } from "@app/graphql/generated"

import { GaloyCurrencyBubble } from "."
import { Story, UseCase } from "../../../../.storybook/views"

const UseCaseWrapper = ({ children, text, style }) => (
  <UseCase style={style} text={text}>
    {children}
  </UseCase>
)

const styles = {
  wrapper: { flexDirection: "row" },
}

export default {
  title: "Galoy Currency Bubble",
  component: GaloyCurrencyBubble,
}

export const Default = () => (
  <Story>
    <UseCaseWrapper style={styles.wrapper} text="Medium">
      <GaloyCurrencyBubble size="medium" currency={WalletCurrency.Btc} />
      <GaloyCurrencyBubble size="medium" currency={WalletCurrency.Usd} />
    </UseCaseWrapper>
    <UseCaseWrapper style={styles.wrapper} text="Large">
      <GaloyCurrencyBubble size="large" currency={WalletCurrency.Btc} />
      <GaloyCurrencyBubble size="large" currency={WalletCurrency.Usd} />
    </UseCaseWrapper>
  </Story>
)
