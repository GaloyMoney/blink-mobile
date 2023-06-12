import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { Meta } from "@storybook/react"
import {
  SendBitcoinDetailsExtraInfo,
  SendBitcoinDetailsExtraInfoProps,
} from "./send-bitcoin-details-extra-info"
import { AmountInvalidReason, LimitType } from "./payment-details"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"

export default {
  title: "Send Bitcoin Details Extra Info",
  component: SendBitcoinDetailsExtraInfo,
  decorators: [
    (Story) => (
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <StoryScreen>{Story()}</StoryScreen>
        </MockedProvider>
      </IsAuthedContextProvider>
    ),
  ],
  parameters: {
    backgrounds: {
      values: [
        { name: "black", value: "#000" },
        { name: "white", value: "#fff" },
      ],
    },
  },
} as Meta<typeof SendBitcoinDetailsExtraInfo>

const sendBitcoinDetailsExtraInfoDefaultProps: SendBitcoinDetailsExtraInfoProps = {
  errorMessage: undefined,
  amountStatus: {
    validAmount: true,
  },
  currentLevel: "ZERO" as const,
}

export const Default = () => {
  return <SendBitcoinDetailsExtraInfo {...sendBitcoinDetailsExtraInfoDefaultProps} />
}

const insufficientBalanceProps: SendBitcoinDetailsExtraInfoProps = {
  amountStatus: {
    validAmount: false,
    invalidReason: AmountInvalidReason.InsufficientBalance,
    balance: { currency: "USD", amount: 50 },
  },
  currentLevel: "ONE" as const,
}

export const InsufficientBalance = () => {
  return <SendBitcoinDetailsExtraInfo {...insufficientBalanceProps} />
}

const insufficientLimitProps: SendBitcoinDetailsExtraInfoProps = {
  amountStatus: {
    validAmount: false,
    invalidReason: AmountInvalidReason.InsufficientLimit,
    remainingLimit: { currency: "USD", amount: 100 }, // This is hypothetical since I don't have the exact structure of MoneyAmount<WalletCurrency> and WalletCurrency
    limitType: LimitType.Intraledger,
  },
  currentLevel: "TWO" as const,
}

export const InsufficientLimit = () => {
  return <SendBitcoinDetailsExtraInfo {...insufficientLimitProps} />
}

const insufficientLimitZeroProps: SendBitcoinDetailsExtraInfoProps = {
  amountStatus: {
    validAmount: false,
    invalidReason: AmountInvalidReason.InsufficientLimit,
    remainingLimit: { currency: "USD", amount: 100 },
    limitType: LimitType.Withdrawal,
  },
  currentLevel: "ZERO" as const,
}

export const InsufficientLimitZero = () => {
  return <SendBitcoinDetailsExtraInfo {...insufficientLimitZeroProps} />
}

const noAmountProps: SendBitcoinDetailsExtraInfoProps = {
  amountStatus: {
    validAmount: false,
    invalidReason: AmountInvalidReason.NoAmount,
  },
  currentLevel: "ZERO" as const,
}

export const NoAmount = () => {
  return <SendBitcoinDetailsExtraInfo {...noAmountProps} />
}

const withErrorMessageProps: SendBitcoinDetailsExtraInfoProps = {
  errorMessage: "Network error. Please try again.",
  amountStatus: {
    validAmount: true,
  },
  currentLevel: "ZERO" as const,
}

export const WithErrorMessage = () => {
  return <SendBitcoinDetailsExtraInfo {...withErrorMessageProps} />
}
