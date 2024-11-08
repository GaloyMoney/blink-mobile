import React, { useEffect, useState } from "react"
import { makeStyles, Text } from "@rneui/themed"

// hooks
import { useDisplayCurrency, usePriceConversion } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { usePersistentStateContext } from "@app/store/persistent-state"

// types
import { BtcMoneyAmount, MoneyAmount, WalletOrDisplayCurrency } from "@app/types/amounts"

// utils
import { fetchBreezLightningLimits } from "@app/utils/breez-sdk-liquid"

type Props = {
  unitOfAccountAmount: MoneyAmount<WalletOrDisplayCurrency>
  minWithdrawableSatoshis: BtcMoneyAmount
  maxWithdrawableSatoshis: BtcMoneyAmount
  amountIsFlexible: boolean
  setHasError: (val: boolean) => void
}

const InforError: React.FC<Props> = ({
  unitOfAccountAmount,
  minWithdrawableSatoshis,
  maxWithdrawableSatoshis,
  amountIsFlexible,
  setHasError,
}) => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { persistentState } = usePersistentStateContext()
  const { formatMoneyAmount } = useDisplayCurrency()
  const { convertMoneyAmount } = usePriceConversion()

  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    fetchLimits()
  }, [])

  const fetchLimits = async () => {
    if (
      persistentState.defaultWallet?.walletCurrency === "BTC" &&
      persistentState.isAdvanceMode
    ) {
      const limits = await fetchBreezLightningLimits()

      if (limits.receive.minSat > unitOfAccountAmount.amount) {
        setHasError(true)
        setErrorMsg(
          LL.SendBitcoinScreen.minAmountInvoiceError({ amount: limits.receive.minSat }),
        )
      } else if (limits.receive.maxSat < unitOfAccountAmount.amount) {
        setHasError(true)
        setErrorMsg(
          LL.SendBitcoinScreen.maxAmountInvoiceError({ amount: limits.receive.maxSat }),
        )
      } else {
        setHasError(false)
        setErrorMsg("")
      }
    } else {
      if (convertMoneyAmount) {
        const convertedAmount = convertMoneyAmount(unitOfAccountAmount, "USD")
        if (convertedAmount.amount < 1) {
          setHasError(true)
          setErrorMsg(
            LL.SendBitcoinScreen.minAmountInvoiceError({
              amount: formatMoneyAmount({
                moneyAmount: { amount: 1, currency: "USD", currencyCode: "USD" },
              }),
            }),
          )
        }
      }
    }
  }

  return (
    <>
      {amountIsFlexible && (
        <Text style={styles.infoText}>
          {LL.RedeemBitcoinScreen.minMaxRange({
            minimumAmount: formatMoneyAmount({
              moneyAmount: minWithdrawableSatoshis,
            }),
            maximumAmount: formatMoneyAmount({
              moneyAmount: maxWithdrawableSatoshis,
            }),
          })}
        </Text>
      )}
      {!!errorMsg && <Text style={styles.withdrawalErrorText}>{errorMsg}</Text>}
    </>
  )
}

export default InforError

const useStyles = makeStyles(({ colors }) => ({
  infoText: {
    color: colors.grey2,
    fontSize: 14,
    marginTop: 10,
  },
  withdrawalErrorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 10,
  },
}))
