import React, { useEffect, useState } from "react"

// components
import { AmountInput } from "../amount-input"
import { NoteInput } from "../note-input"

// types
import { MoneyAmount, WalletOrDisplayCurrency } from "@app/types/amounts"
import { Invoice } from "@app/screens/receive-bitcoin-screen/payment/index.types"

// utils
import {
  fetchBreezLightningLimits,
  fetchBreezOnChainLimits,
} from "@app/utils/breez-sdk-liquid"

type Props = {
  request: any
}

const AmountNote: React.FC<Props> = ({ request }) => {
  const [minAmount, setMinAmount] = useState<MoneyAmount<WalletOrDisplayCurrency>>()
  const [maxAmount, setMaxAmount] = useState<MoneyAmount<WalletOrDisplayCurrency>>()

  useEffect(() => {
    fetchMinMaxAmount()
  }, [request.receivingWalletDescriptor.currency, request.type])

  const fetchMinMaxAmount = async () => {
    if (request.receivingWalletDescriptor.currency === "BTC") {
      let limits
      if (request.type === Invoice.Lightning) {
        limits = await fetchBreezLightningLimits()
      } else if (request.type === Invoice.OnChain) {
        limits = await fetchBreezOnChainLimits()
      }

      setMinAmount({
        amount: limits?.receive.minSat || 0,
        currency: "BTC",
        currencyCode: "SAT",
      })
      setMaxAmount({
        amount: limits?.receive.maxSat || 0,
        currency: "BTC",
        currencyCode: "SAT",
      })
    }
  }

  if (request.type !== "PayCode") {
    return (
      <>
        <AmountInput
          request={request}
          unitOfAccountAmount={request.unitOfAccountAmount}
          setAmount={request.setAmount}
          canSetAmount={request.canSetAmount}
          convertMoneyAmount={request.convertMoneyAmount}
          walletCurrency={request.receivingWalletDescriptor.currency}
          showValuesIfDisabled={false}
          minAmount={minAmount}
          maxAmount={maxAmount}
          big={false}
        />
        <NoteInput
          onBlur={request.setMemo}
          onChangeText={request.setMemoChangeText}
          value={request.memoChangeText || ""}
          editable={request.canSetMemo}
          style={{ marginTop: 10 }}
          big={false}
        />
      </>
    )
  } else {
    return null
  }
}

export default AmountNote
