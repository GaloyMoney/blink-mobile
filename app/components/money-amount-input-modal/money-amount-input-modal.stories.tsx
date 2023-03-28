import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import {
  MoneyAmountInputModal,
  MoneyAmountInputModalProps,
} from "./money-amount-input-modal"
import { WalletCurrency } from "../../graphql/generated"
import mocks from "../../graphql/mocks"
import {
  DisplayCurrency,
  MoneyAmount,
  WalletOrDisplayCurrency,
  ZeroDisplayAmount,
} from "../../types/amounts"
import { View } from "react-native"

export default {
  title: "Money Amount Input Modal",
  component: MoneyAmountInputModal,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as ComponentMeta<typeof MoneyAmountInputModal>

const moneyAmountInputModalDefaultProps: MoneyAmountInputModalProps = {
  moneyAmount: {
    amount: 0,
    currency: DisplayCurrency,
  },
  walletCurrency: WalletCurrency.Btc,
  setAmount: (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>) =>
    console.log("set amount: ", moneyAmount),
  convertMoneyAmount: (moneyAmount, toCurrency) => {
    return {
      amount: moneyAmount.amount,
      currency: toCurrency,
    }
  },
}

export const Default = () => {
  const [moneyAmount, setMoneyAmount] =
    React.useState<MoneyAmount<WalletOrDisplayCurrency>>(ZeroDisplayAmount)

  return (
    <View>
      <MockedProvider mocks={mocks} cache={createCache()}>
        <MoneyAmountInputModal
          {...moneyAmountInputModalDefaultProps}
          moneyAmount={moneyAmount}
          setAmount={setMoneyAmount}
        />
      </MockedProvider>
    </View>
  )
}

export const WalletCurrencyIsDisplayCurrency = () => {
  const [moneyAmount, setMoneyAmount] =
    React.useState<MoneyAmount<WalletOrDisplayCurrency>>(ZeroDisplayAmount)

  return (
    <View>
      <MockedProvider mocks={mocks} cache={createCache()}>
        <MoneyAmountInputModal
          {...moneyAmountInputModalDefaultProps}
          walletCurrency={WalletCurrency.Usd}
          moneyAmount={moneyAmount}
          setAmount={setMoneyAmount}
        />
      </MockedProvider>
    </View>
  )
}

export const AmountIsNotEditable = () => {
  const [moneyAmount, setMoneyAmount] = React.useState<
    MoneyAmount<WalletOrDisplayCurrency>
  >({
    amount: 1234,
    currency: WalletCurrency.Usd,
  })

  return (
    <View>
      <MockedProvider mocks={mocks} cache={createCache()}>
        <MoneyAmountInputModal
          {...moneyAmountInputModalDefaultProps}
          walletCurrency={WalletCurrency.Usd}
          moneyAmount={moneyAmount}
          setAmount={setMoneyAmount}
          canSetAmount={false}
        />
      </MockedProvider>
    </View>
  )
}
