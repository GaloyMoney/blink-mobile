import { useState } from "react"
import { gql, useMutation } from "@apollo/client"
import { textCurrencyFormatting } from "../../utils/currencyConversion"

const LIGHTNING_FEES = gql`
mutation lightning_fees($invoice: String, $amount: Int) {
  invoice {
    getFee(invoice: $invoice, amount: $amount)
  }
}
`

const ONCHAIN_FEES = gql`
mutation onchain_fees($address: String!, $amount: Int) {
  onchain {
    getFee(address: $address, amount: $amount)
  }
}
`

const useFee = ({
  address,
  amountless,
  invoice,
  paymentType,
  sameNode,
  paymentSatAmount,
  btcPrice,
  primaryCurrency,
}) => {
  const [fee, setFee] = useState<{
    value: number | null
    status: "loading" | "error" | "unset" | "set"
  }>({
    value: null, // TODO: get rid of this
    status: "unset",
  })

  const [getLightningFees] = useMutation(LIGHTNING_FEES)
  const [getOnchainFees] = useMutation(ONCHAIN_FEES)

  if (fee.status !== "unset") {
    if (fee.status === "loading") {
      return { ...fee, text: "" }
    }

    if (fee.status === "error") {
      return { ...fee, text: "" }
    }

    if (fee.value === null && paymentType !== "username") {
      return { ...fee, text: "" }
    }

    return {
      ...fee,
      text: textCurrencyFormatting(fee.value ?? 0, btcPrice, primaryCurrency),
    }
  }

  const initializeFee = async () => {
    if (paymentType == "lightning") {
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
        const {
          data: {
            invoice: { getFee: feeValue },
          },
        } = await getLightningFees({
          variables: { invoice, amount: amountless ? paymentSatAmount : undefined },
        })
        setFee({
          value: feeValue,
          status: "set",
        })
      } catch (err) {
        console.warn({ err, message: "error getting lightning fees" })
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
        const {
          data: {
            onchain: { getFee: feeValue },
          },
        } = await getOnchainFees({
          variables: { address, amount: paymentSatAmount },
        })
        setFee({
          value: feeValue,
          status: "set",
        })
      } catch (err) {
        console.warn({ err, message: "error getting onchains fees" })
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
