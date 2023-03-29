import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { AmountInputScreen, AmountInputScreenProps } from "./amount-input-screen"
import { WalletCurrency } from "../../graphql/generated"
import mocks from "../../graphql/mocks"
import {
  DisplayCurrency,
  MoneyAmount,
  WalletOrDisplayCurrency,
} from "../../types/amounts"

export default {
  title: "Amount Input Screen",
  component: AmountInputScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as ComponentMeta<typeof AmountInputScreen>

const amountInputDefaultProps: AmountInputScreenProps = {
  initialAmount: {
    amount: 0,
    currency: DisplayCurrency,
  },
  walletCurrency: WalletCurrency.Btc,
  setAmount: (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>) =>
    console.log("set amount: ", moneyAmount),
  goBack: () => console.log("go back"),
  convertMoneyAmount: (moneyAmount, toCurrency) => {
    return {
      amount: moneyAmount.amount,
      currency: toCurrency,
    }
  },
}

export const NoAmount = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <AmountInputScreen {...amountInputDefaultProps} />
  </MockedProvider>
)

const amountProps: AmountInputScreenProps = {
  ...amountInputDefaultProps,
  initialAmount: {
    amount: 100,
    currency: DisplayCurrency,
  },
}

export const Amount = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <AmountInputScreen {...amountProps} />
  </MockedProvider>
)

const maxAmountExceededProps: AmountInputScreenProps = {
  ...amountInputDefaultProps,
  initialAmount: {
    amount: 200,
    currency: DisplayCurrency,
  },
  maxAmount: {
    amount: 100,
    currency: DisplayCurrency,
  },
}

export const MaxAmountExceeded = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <AmountInputScreen {...maxAmountExceededProps} />
  </MockedProvider>
)

const noSecondaryCurrencyProps: AmountInputScreenProps = {
  ...amountInputDefaultProps,
  walletCurrency: WalletCurrency.Usd,
}

export const NoSecondaryCurrency = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <AmountInputScreen {...noSecondaryCurrencyProps} />
  </MockedProvider>
)
