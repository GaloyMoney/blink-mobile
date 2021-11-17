import { useState } from "react"
import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client"

import { MAIN_QUERY } from "../../graphql/query"
import useToken from "../../utils/use-token"
import { useMySubscription } from "../../hooks/user-hooks"

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
  primaryCurrency: CurrencyType
}

type UseFeeReturn = {
  value: number | null
  status: "loading" | "error" | "unset" | "set"
  text: string
  defaultWalletId: string
}

const useFee = ({
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
  const { hasToken } = useToken()
  const { data: dataMain } = useQuery(MAIN_QUERY, {
    variables: { hasToken },
  })

  const defaultWalletId = dataMain?.me?.defaultAccount?.defaultWalletId

  const [fee, setFee] = useState<FeeType>({
    value: null,
    status: "unset",
  })

  const [getLightningFees] = useMutation(LIGHTNING_FEES)
  const [getNoAmountLightningFees] = useMutation(NO_AMOUNT_LIGHTNING_FEES)
  // const [getOnchainFees] = useMutation(ONCHAIN_FEES)

  if (fee.status !== "unset") {
    if (
      fee.status === "loading" ||
      fee.status === "error" ||
      (fee.value === null && paymentType !== "username")
    ) {
      return { ...fee, text: "", defaultWalletId }
    }

    return {
      ...fee,
      text: formatCurrencyAmount({ sats: fee.value ?? 0, currency: primaryCurrency }),
      defaultWalletId,
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
          variables: { walletId: defaultWalletId, address, amount: paymentSatAmount },
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

  return { ...fee, text: "", defaultWalletId }
}

export default useFee
