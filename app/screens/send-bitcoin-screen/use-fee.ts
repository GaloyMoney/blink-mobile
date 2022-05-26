import { useState } from "react"
import { useApolloClient } from "@apollo/client"

import { useMySubscription } from "../../hooks/user-hooks"
import { QUERIES, useMutation } from "@galoymoney/client"

type FeeType = {
  value: number | null
  status: "loading" | "error" | "unset" | "set"
}

type UseFeeInput = {
  walletId: string
  address: string
  amountless: boolean
  invoice: string
  paymentType: string
  sameNode: boolean
  paymentSatAmount: number
  primaryCurrency: CurrencyType
}

type UseFeeReturn = {
  value: number | null
  status: "loading" | "error" | "unset" | "set"
  text: string
}

const useFee = ({
  walletId,
  address,
  amountless,
  invoice,
  paymentType,
  sameNode,
  paymentSatAmount,
  primaryCurrency,
}: UseFeeInput): UseFeeReturn => {
  const client = useApolloClient()
  const { formatCurrencyAmount } = useMySubscription()

  const [fee, setFee] = useState<FeeType>({
    value: null,
    status: "unset",
  })

  const [lnInvoiceFeeProbe] = useMutation.lnInvoiceFeeProbe()
  const [lnNoAmountInvoiceFeeProbe] = useMutation.lnNoAmountInvoiceFeeProbe()

  if (!walletId) {
    return { ...fee, text: "" }
  }

  if (fee.status !== "unset") {
    if (
      fee.status === "loading" ||
      fee.status === "error" ||
      (fee.value === null && paymentType !== "username")
    ) {
      return { ...fee, text: "" }
    }

    return {
      ...fee,
      text: formatCurrencyAmount({ sats: fee.value ?? 0, currency: primaryCurrency }),
    }
  }

  const initializeFee = async () => {
    if (paymentType === "lightning" || paymentType === "lnurl") {
      if (sameNode) {
        return setFee({
          value: 0,
          status: "set",
        })
      }

      if (amountless && paymentSatAmount === 0) {
        return setFee({
          value: null,
          status: "set",
        })
      }

      try {
        setFee({
          value: null,
          status: "loading",
        })

        let feeValue: number
        if (amountless) {
          const { data, errorsMessage } = await lnNoAmountInvoiceFeeProbe({
            variables: {
              input: { walletId, paymentRequest: invoice, amount: paymentSatAmount },
            },
          })
          if (errorsMessage) {
            throw new Error("Error returned from API while calculating fee.")
          }
          feeValue = data.lnNoAmountInvoiceFeeProbe.amount
        } else {
          const { data, errorsMessage } = await lnInvoiceFeeProbe({
            variables: { input: { walletId, paymentRequest: invoice } },
          })
          if (errorsMessage) {
            throw new Error("Error returned from API while calculating fee.")
          }
          feeValue = data.lnInvoiceFeeProbe.amount
        }

        setFee({
          value: feeValue,
          status: "set",
        })
      } catch (err) {
        console.debug({ err, message: "error getting lightning fees" })
        setFee({
          value: null,
          status: "error",
        })
      }
      return
    }

    if (paymentType === "onchain") {
      if (paymentSatAmount === 0) {
        return setFee({
          value: null,
          status: "set",
        })
      }

      try {
        setFee({
          value: null,
          status: "loading",
        })

        // FIXME: Switch this to a delayed query
        const { data } = await client.query({
          query: QUERIES.onChainTxFee,
          variables: { walletId, address, amount: paymentSatAmount },
          fetchPolicy: "no-cache",
        })
        const feeValue = data.onChainTxFee.amount

        setFee({
          value: feeValue,
          status: "set",
        })
      } catch (err) {
        console.debug({ err, message: "error getting onchains fees" })
        setFee({
          value: null,
          status: "error",
        })
      }
      return
    }

    return setFee({
      value: null,
      status: "set",
    })
  }

  initializeFee()

  return { ...fee, text: "" }
}

export default useFee
