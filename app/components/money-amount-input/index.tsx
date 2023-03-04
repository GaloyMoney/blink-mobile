import { WalletCurrency } from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { DisplayCurrency, MoneyAmount, WalletOrDisplayCurrency } from "@app/types/amounts"
import { StyleProp, TextStyle } from "react-native"
import { FakeCurrencyInput } from "react-native-currency-input"
import React from "react"

type MoneyAmountPaymentInputProps = {
  moneyAmount: MoneyAmount<WalletOrDisplayCurrency>
  setAmount?: (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>) => void
  style?: StyleProp<TextStyle>
  editable?: boolean
}

export const MoneyAmountInput = ({
  moneyAmount,
  setAmount,
  style,
  editable,
  ...props
}: MoneyAmountPaymentInputProps) => {
  const {
    moneyAmountToMajorUnitOrSats,
    amountInMajorUnitOrSatsToMoneyAmount,
    fractionDigits,
    fiatSymbol,
  } = useDisplayCurrency()

  let prefix: string | undefined
  let suffix: string | undefined
  let precision: number | undefined
  switch (moneyAmount.currency) {
    case WalletCurrency.Btc:
      prefix = ""
      suffix = moneyAmount.amount === 1 ? " sat" : " sats"
      precision = 0
      break
    case WalletCurrency.Usd:
      prefix = "$"
      suffix = ""
      precision = 2
      break
    case DisplayCurrency:
      prefix = fiatSymbol
      suffix = ""
      precision = fractionDigits
      break
  }

  return (
    <FakeCurrencyInput
      value={moneyAmountToMajorUnitOrSats(moneyAmount)}
      onChangeValue={(amount) =>
        setAmount &&
        setAmount(
          amountInMajorUnitOrSatsToMoneyAmount(Number(amount), moneyAmount.currency),
        )
      }
      prefix={prefix}
      delimiter=","
      separator="."
      precision={precision}
      suffix={suffix}
      minValue={0}
      style={style}
      editable
      {...props}
    />
  )
}
