import * as React from "react"
import { WalletCurrency } from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { ConvertMoneyAmount } from "@app/screens/send-bitcoin-screen/payment-details"
import {
  DisplayCurrency,
  greaterThan,
  lessThan,
  MoneyAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"
import { useCallback, useEffect, useReducer } from "react"
import { AmountInputScreenUI } from "./amount-input-screen-ui"
import {
  Key,
  NumberPadNumber,
  numberPadReducer,
  NumberPadReducerActionType,
  NumberPadReducerState,
} from "./number-pad-reducer"

export type AmountInputScreenProps = {
  goBack: () => void
  initialAmount: MoneyAmount<WalletOrDisplayCurrency>
  setAmount?: (amount: MoneyAmount<WalletOrDisplayCurrency>) => void
  walletCurrency: WalletCurrency
  convertMoneyAmount: ConvertMoneyAmount
  maxAmount?: MoneyAmount<WalletOrDisplayCurrency>
  minAmount?: MoneyAmount<WalletOrDisplayCurrency>
}

const formatNumberPadNumber = (numberPadNumber: NumberPadNumber) => {
  const { majorAmount, minorAmount, hasDecimal } = numberPadNumber

  if (!majorAmount && !minorAmount && !hasDecimal) {
    return ""
  }

  const formattedMajorAmount = Number(majorAmount).toLocaleString()

  if (hasDecimal) {
    return `${formattedMajorAmount}.${minorAmount}`
  }

  return formattedMajorAmount
}

const numberPadNumberToMoneyAmount = ({
  numberPadNumber,
  currency,
  minorUnitToMajorUnitOffset,
}: {
  numberPadNumber: NumberPadNumber
  currency: WalletOrDisplayCurrency
  minorUnitToMajorUnitOffset: number
}): MoneyAmount<WalletOrDisplayCurrency> => {
  const { majorAmount, minorAmount } = numberPadNumber

  const majorAmountInMinorUnit =
    Math.pow(10, minorUnitToMajorUnitOffset) * Number(majorAmount)

  // if minorUnitToMajorUnitOffset is 2, slice 234354 to 23
  const slicedMinorAmount = minorAmount.slice(0, minorUnitToMajorUnitOffset)
  // if minorAmount is 4 and minorUnitToMajorUnitOffset is 2, then missing zeros is 1
  const minorAmountMissingZeros = minorUnitToMajorUnitOffset - slicedMinorAmount.length

  const amount =
    majorAmountInMinorUnit + Number(minorAmount) * Math.pow(10, minorAmountMissingZeros)
  return {
    amount,
    currency,
  }
}

const moneyAmountToNumberPadReducerState = ({
  moneyAmount,
  currencyInfo,
}: {
  moneyAmount: MoneyAmount<WalletOrDisplayCurrency>
  currencyInfo: ReturnType<typeof useDisplayCurrency>["currencyInfo"]
}): NumberPadReducerState => {
  const amountString = moneyAmount.amount.toString()
  const { minorUnitToMajorUnitOffset, showFractionDigits } =
    currencyInfo[moneyAmount.currency]

  let numberPadNumber: NumberPadNumber

  if (amountString === "0") {
    numberPadNumber = {
      majorAmount: "",
      minorAmount: "",
      hasDecimal: false,
    }
  } else if (amountString.length <= minorUnitToMajorUnitOffset) {
    numberPadNumber = {
      majorAmount: "0",
      minorAmount: showFractionDigits
        ? amountString.padStart(minorUnitToMajorUnitOffset, "0")
        : "",
      hasDecimal: showFractionDigits,
    }
  } else {
    numberPadNumber = {
      majorAmount: amountString.slice(
        0,
        amountString.length - minorUnitToMajorUnitOffset,
      ),
      minorAmount: showFractionDigits
        ? amountString.slice(amountString.length - minorUnitToMajorUnitOffset)
        : "",
      hasDecimal: showFractionDigits && minorUnitToMajorUnitOffset > 0,
    }
  }

  return {
    numberPadNumber,
    numberOfDecimalsAllowed: showFractionDigits ? minorUnitToMajorUnitOffset : 0,
    currency: moneyAmount.currency,
  }
}

export const AmountInputScreen: React.FC<AmountInputScreenProps> = ({
  goBack,
  initialAmount,
  setAmount,
  walletCurrency,
  convertMoneyAmount,
  maxAmount,
  minAmount,
}) => {
  const { currencyInfo, getSecondaryAmountIfCurrencyIsDifferent, formatMoneyAmount } =
    useDisplayCurrency()

  const { LL } = useI18nContext()

  const [numberPadState, dispatchNumberPadAction] = useReducer(
    numberPadReducer,
    moneyAmountToNumberPadReducerState({
      moneyAmount: initialAmount,
      currencyInfo,
    }),
  )

  const newPrimaryAmount = numberPadNumberToMoneyAmount({
    numberPadNumber: numberPadState.numberPadNumber,
    currency: numberPadState.currency,
    minorUnitToMajorUnitOffset:
      currencyInfo[numberPadState.currency].minorUnitToMajorUnitOffset,
  })

  const secondaryNewAmount = getSecondaryAmountIfCurrencyIsDifferent({
    primaryAmount: newPrimaryAmount,
    walletAmount: convertMoneyAmount(newPrimaryAmount, walletCurrency),
    displayAmount: convertMoneyAmount(newPrimaryAmount, DisplayCurrency),
  })

  const onKeyPress = (key: Key) => {
    dispatchNumberPadAction({
      action: NumberPadReducerActionType.HandleKeyPress,
      payload: {
        key,
      },
    })
  }

  const onClear = () => {
    dispatchNumberPadAction({
      action: NumberPadReducerActionType.ClearAmount,
    })
  }

  const setNumberPadAmount = useCallback(
    (amount: MoneyAmount<WalletOrDisplayCurrency>) => {
      dispatchNumberPadAction({
        action: NumberPadReducerActionType.SetAmount,
        payload: moneyAmountToNumberPadReducerState({
          moneyAmount: amount,
          currencyInfo,
        }),
      })
    },
    [currencyInfo],
  )

  const onToggleCurrency =
    secondaryNewAmount &&
    (() => {
      setNumberPadAmount(secondaryNewAmount)
    })

  useEffect(() => {
    setNumberPadAmount(initialAmount)
  }, [initialAmount, setNumberPadAmount])

  let errorMessage = ""
  if (
    maxAmount &&
    greaterThan({
      value: convertMoneyAmount(newPrimaryAmount, maxAmount.currency),
      greaterThan: maxAmount,
    })
  ) {
    errorMessage = LL.AmountInputScreen.maxAmountExceeded({
      maxAmount: formatMoneyAmount({ moneyAmount: maxAmount }),
    })
  } else if (
    minAmount &&
    lessThan({
      value: convertMoneyAmount(newPrimaryAmount, minAmount.currency),
      lessThan: minAmount,
    })
  ) {
    errorMessage = LL.AmountInputScreen.minAmountNotMet({
      minAmount: formatMoneyAmount({ moneyAmount: minAmount }),
    })
  }

  const primaryCurrencyInfo = currencyInfo[newPrimaryAmount.currency]
  const secondaryCurrencyInfo =
    secondaryNewAmount && currencyInfo[secondaryNewAmount.currency]

  return (
    <AmountInputScreenUI
      primaryCurrencyCode={primaryCurrencyInfo.currencyCode}
      primaryCurrencyFormattedAmount={formatNumberPadNumber(
        numberPadState.numberPadNumber,
      )}
      primaryCurrencySymbol={primaryCurrencyInfo.symbol}
      secondaryCurrencyCode={secondaryCurrencyInfo?.currencyCode}
      secondaryCurrencyFormattedAmount={
        secondaryNewAmount &&
        formatMoneyAmount({
          moneyAmount: secondaryNewAmount,
          noSuffix: true,
          noSymbol: true,
        })
      }
      secondaryCurrencySymbol={secondaryCurrencyInfo?.symbol}
      errorMessage={errorMessage}
      onKeyPress={onKeyPress}
      onClearAmount={onClear}
      onToggleCurrency={onToggleCurrency}
      setAmountDisabled={Boolean(errorMessage)}
      onSetAmountPress={setAmount && (() => setAmount(newPrimaryAmount))}
      goBack={goBack}
    />
  )
}
