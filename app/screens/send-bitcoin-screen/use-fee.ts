import { useState } from "react"
import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client"

import { textCurrencyFormatting } from "../../utils/currencyConversion"
import { MAIN_QUERY } from "../../graphql/query"
import useToken from "../../utils/use-token"

const LIGHTNING_FEES = gql`
  mutation lnInvoiceFeeProbe($input: LnInvoiceFeeProbeInput!) {
    lnInvoiceFeeProbe(input: $input) {
      errors {
        message
      }

      amount
    }
  }
`

const NO_AMOUNT_LIGHTNING_FEES = gql`
  mutation lnNoAmountInvoiceFeeProbe($input: LnNoAmountInvoiceFeeProbeInput!) {
    lnNoAmountInvoiceFeeProbe(input: $input) {
      errors {
        message
      }

      amount
    }
  }
`

const ONCHAIN_FEES = gql`
  query onChainTxFee(
    $walletId: WalletId!
    $address: OnChainAddress!
    $amount: SatAmount!
    $targetConfirmations: TargetConfirmations
  ) {
    onChainTxFee(
      walletId: $walletId
      address: $address
      amount: $amount
      targetConfirmations: $targetConfirmations
    ) {
      amount
      targetConfirmations
    }
  }
`

type FeeType = {
  value: number | null
  status: "loading" | "error" | "unset" | "set"
}

type UseFeeInput = {
  address: string
  amountless: boolean
  invoice: string
  paymentType: string
  sameNode: boolean
  paymentSatAmount: number
  btcPrice: number
  primaryCurrency: CurrencyType
}

type UseFeeReturn = {
  value: number | null
  status: "loading" | "error" | "unset" | "set"
  text: string
}

const useFee = ({
  address,
  amountless,
  invoice,
  paymentType,
  sameNode,
  paymentSatAmount,
  btcPrice,
  primaryCurrency,
}: UseFeeInput): UseFeeReturn => {
  const client = useApolloClient()
  const { hasToken } = useToken()
  const { data: dataMain } = useQuery(MAIN_QUERY, {
    variables: { hasToken },
  })
  const walletId = dataMain?.wallet?.[0]?.id ?? ""

  const [fee, setFee] = useState<FeeType>({
    value: null,
    status: "unset",
  })

  const [getLightningFees] = useMutation(LIGHTNING_FEES)
  const [getNoAmountLightningFees] = useMutation(NO_AMOUNT_LIGHTNING_FEES)
  // const [getOnchainFees] = useMutation(ONCHAIN_FEES)

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

        let feeValue: number
        if (amountless) {
          const { data } = await getNoAmountLightningFees({
            variables: { input: { paymentRequest: invoice, amount: paymentSatAmount } },
          })

          feeValue = data.lnNoAmountInvoiceFeeProbe.amount
        } else {
          const { data } = await getLightningFees({
            variables: { input: { paymentRequest: invoice } },
          })

          feeValue = data.lnInvoiceFeeProbe.amount
        }

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

        const { data } = await client.query({
          query: ONCHAIN_FEES,
          variables: { walletId, address, amount: paymentSatAmount },
          fetchPolicy: "no-cache",
        })
        const feeValue = data.onChainTxFee.amount

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
