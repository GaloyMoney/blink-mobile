import * as React from "react"
import { WalletCurrency } from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { ConvertMoneyAmount } from "@app/screens/send-bitcoin-screen/payment-details"
import {
  DisplayCurrency,
  isNonZeroMoneyAmount,
  MoneyAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"
import { testProps } from "@app/utils/testProps"
import { AmountInputModal } from "./amount-input-modal"
import { AmountInputButton } from "./amount-input-button"

export type AmountInputProps = {
  moneyAmount?: MoneyAmount<WalletOrDisplayCurrency>
  walletCurrency: WalletCurrency
  convertMoneyAmount: ConvertMoneyAmount
  setAmount?: (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>) => void
  maxAmount?: MoneyAmount<WalletOrDisplayCurrency>
  minAmount?: MoneyAmount<WalletOrDisplayCurrency>
  canSetAmount?: boolean
}

export const AmountInput: React.FC<AmountInputProps> = ({
  moneyAmount,
  walletCurrency,
  setAmount,
  maxAmount,
  minAmount,
  convertMoneyAmount,
  canSetAmount = true,
}) => {
  const [isSettingAmount, setIsSettingAmount] = React.useState(false)
  const { formatMoneyAmount, getSecondaryAmountIfCurrencyIsDifferent } =
    useDisplayCurrency()
  const { LL } = useI18nContext()

  const onSetAmount = (amount: MoneyAmount<WalletOrDisplayCurrency>) => {
    setAmount && setAmount(amount)
    setIsSettingAmount(false)
  }

  if (isSettingAmount) {
    return (
      <AmountInputModal
        moneyAmount={moneyAmount}
        isOpen={isSettingAmount}
        walletCurrency={walletCurrency}
        convertMoneyAmount={convertMoneyAmount}
        onSetAmount={onSetAmount}
        maxAmount={maxAmount}
        minAmount={minAmount}
        close={() => setIsSettingAmount(false)}
      />
    )
  }

  let formattedPrimaryAmount = undefined
  let formattedSecondaryAmount = undefined

  if (isNonZeroMoneyAmount(moneyAmount)) {
    const isBtcDenominatedUsdWalletAmount =
      walletCurrency === WalletCurrency.Usd && moneyAmount.currency === WalletCurrency.Btc
    const primaryAmount = isBtcDenominatedUsdWalletAmount
      ? convertMoneyAmount(moneyAmount, walletCurrency)
      : moneyAmount
    formattedPrimaryAmount = isBtcDenominatedUsdWalletAmount
      ? formatMoneyAmount({ moneyAmount: primaryAmount, isApproximate: true })
      : formatMoneyAmount({ moneyAmount: primaryAmount })
    const secondaryAmount = getSecondaryAmountIfCurrencyIsDifferent({
      primaryAmount,
      walletAmount: convertMoneyAmount(moneyAmount, walletCurrency),
      displayAmount: convertMoneyAmount(moneyAmount, DisplayCurrency),
    })
    formattedSecondaryAmount =
      secondaryAmount && formatMoneyAmount({ moneyAmount: secondaryAmount })
  }

  const onPressInputButton = () => {
    setIsSettingAmount(true)
  }

  if (canSetAmount) {
    return (
      <AmountInputButton
        placeholder={LL.AmountInputButton.tapToSetAmount()}
        onPress={onPressInputButton}
        value={formattedPrimaryAmount}
        iconName="pencil"
        secondaryValue={formattedSecondaryAmount}
        primaryTextTestProps={"Amount Input Button Amount"}
        {...testProps("Amount Input Button")}
      />
    )
  }
  return (
    <AmountInputButton
      value={formattedPrimaryAmount}
      secondaryValue={formattedSecondaryAmount}
      disabled={true}
      primaryTextTestProps={"Amount Input Button Amount"}
      {...testProps("Amount Input Button")}
    />
  )
}
