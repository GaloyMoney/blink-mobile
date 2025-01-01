import { useCallback } from "react"
import { gql } from "@apollo/client"
import { WalletAmount } from "@app/types/amounts"
import crashlytics from "@react-native-firebase/crashlytics"
import { GetFee } from "@app/screens/send-bitcoin-screen/payment-details"
import {
  WalletCurrency,
  useLnInvoiceFeeProbeMutation,
  useLnNoAmountInvoiceFeeProbeMutation,
  useLnNoAmountUsdInvoiceFeeProbeMutation,
  useLnUsdInvoiceFeeProbeMutation,
  useOnChainTxFeeLazyQuery,
  useOnChainUsdTxFeeAsBtcDenominatedLazyQuery,
  useOnChainUsdTxFeeLazyQuery,
} from "@app/graphql/generated"

export type FeeType =
  | {
      status: "loading" | "error" | "unset"
      amount?: undefined | null
    }
  | {
      amount: WalletAmount<WalletCurrency>
      status: "set"
    }
  | {
      amount?: WalletAmount<WalletCurrency>
      status: "error"
    }

gql`
  mutation lnNoAmountInvoiceFeeProbe($input: LnNoAmountInvoiceFeeProbeInput!) {
    lnNoAmountInvoiceFeeProbe(input: $input) {
      errors {
        message
      }
      amount
    }
  }

  mutation lnInvoiceFeeProbe($input: LnInvoiceFeeProbeInput!) {
    lnInvoiceFeeProbe(input: $input) {
      errors {
        message
      }
      amount
    }
  }

  mutation lnUsdInvoiceFeeProbe($input: LnUsdInvoiceFeeProbeInput!) {
    lnUsdInvoiceFeeProbe(input: $input) {
      errors {
        message
      }
      amount
    }
  }

  mutation lnNoAmountUsdInvoiceFeeProbe($input: LnNoAmountUsdInvoiceFeeProbeInput!) {
    lnNoAmountUsdInvoiceFeeProbe(input: $input) {
      errors {
        message
      }
      amount
    }
  }

  query onChainTxFee(
    $walletId: WalletId!
    $address: OnChainAddress!
    $amount: SatAmount!
  ) {
    onChainTxFee(walletId: $walletId, address: $address, amount: $amount) {
      amount
    }
  }

  query onChainUsdTxFee(
    $walletId: WalletId!
    $address: OnChainAddress!
    $amount: CentAmount!
  ) {
    onChainUsdTxFee(walletId: $walletId, address: $address, amount: $amount) {
      amount
    }
  }

  query onChainUsdTxFeeAsBtcDenominated(
    $walletId: WalletId!
    $address: OnChainAddress!
    $amount: SatAmount!
  ) {
    onChainUsdTxFeeAsBtcDenominated(
      walletId: $walletId
      address: $address
      amount: $amount
    ) {
      amount
    }
  }
`

export const useIbexFee = <T extends WalletCurrency>() => {
  const [lnInvoiceFeeProbe] = useLnInvoiceFeeProbeMutation()
  const [lnNoAmountInvoiceFeeProbe] = useLnNoAmountInvoiceFeeProbeMutation()
  const [lnUsdInvoiceFeeProbe] = useLnUsdInvoiceFeeProbeMutation()
  const [lnNoAmountUsdInvoiceFeeProbe] = useLnNoAmountUsdInvoiceFeeProbeMutation()
  const [onChainTxFee] = useOnChainTxFeeLazyQuery()
  const [onChainUsdTxFee] = useOnChainUsdTxFeeLazyQuery()
  const [onChainUsdTxFeeAsBtcDenominated] = useOnChainUsdTxFeeAsBtcDenominatedLazyQuery()

  const fetchIbexFee = useCallback(
    async (getFeeFn?: GetFee<T> | null) => {
      if (!getFeeFn) {
        return
      }
      try {
        const feeResponse = await getFeeFn({
          lnInvoiceFeeProbe,
          lnNoAmountInvoiceFeeProbe,
          lnUsdInvoiceFeeProbe,
          lnNoAmountUsdInvoiceFeeProbe,
          onChainTxFee,
          onChainUsdTxFee,
          onChainUsdTxFeeAsBtcDenominated,
        })

        if (feeResponse.errors?.length || !feeResponse.amount) {
          return undefined
        }

        return feeResponse.amount
      } catch (err) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
        }
        return undefined
      }
    },
    [
      lnInvoiceFeeProbe,
      lnNoAmountInvoiceFeeProbe,
      lnUsdInvoiceFeeProbe,
      lnNoAmountUsdInvoiceFeeProbe,
      onChainTxFee,
      onChainUsdTxFee,
      onChainUsdTxFeeAsBtcDenominated,
    ],
  )

  return fetchIbexFee
}
