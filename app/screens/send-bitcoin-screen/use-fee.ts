import { useState, useEffect } from "react"
import { WalletDescriptor } from "@app/types/wallets"
import { PaymentAmount } from "@app/types/amounts"
import crashlytics from "@react-native-firebase/crashlytics"
import {
  WalletCurrency,
  useLnInvoiceFeeProbeMutation,
  useLnNoAmountInvoiceFeeProbeMutation,
  useLnNoAmountUsdInvoiceFeeProbeMutation,
  useLnUsdInvoiceFeeProbeMutation,
  useOnChainTxFeeLazyQuery,
} from "@app/graphql/generated"
import { gql } from "@apollo/client"

type FeeType = {
  amount?: PaymentAmount<WalletCurrency>
  status: "loading" | "error" | "unset" | "set"
}

type UseFeeInput = {
  walletDescriptor: WalletDescriptor<WalletCurrency>
  address: string
  isNoAmountInvoice: boolean
  invoice: string
  paymentType: string
  sameNode: boolean
  paymentAmount: PaymentAmount<WalletCurrency>
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
`

const useFee = ({
  walletDescriptor,
  address,
  isNoAmountInvoice,
  invoice,
  paymentType,
  sameNode,
  paymentAmount,
}: UseFeeInput): FeeType => {
  const [fee, setFee] = useState<FeeType>({
    status: "unset",
  })

  const [lnInvoiceFeeProbe] = useLnInvoiceFeeProbeMutation()
  const [lnNoAmountInvoiceFeeProbe] = useLnNoAmountInvoiceFeeProbeMutation()
  const [lnUsdInvoiceFeeProbe] = useLnUsdInvoiceFeeProbeMutation()
  const [lnNoAmountUsdInvoiceFeeProbe] = useLnNoAmountUsdInvoiceFeeProbeMutation()
  const [onChainTxFee] = useOnChainTxFeeLazyQuery()
  const getLightningFees =
    walletDescriptor.currency === WalletCurrency.Btc
      ? lnInvoiceFeeProbe
      : lnUsdInvoiceFeeProbe

  const getNoAmountLightningFees =
    walletDescriptor.currency === WalletCurrency.Btc
      ? lnNoAmountInvoiceFeeProbe
      : lnNoAmountUsdInvoiceFeeProbe

  useEffect(() => {
    const initializeFee = async () => {
      if (paymentType === "intraledger") {
        return setFee({
          amount: { amount: 0, currency: walletDescriptor.currency },
          status: "set",
        })
      }

      if (paymentType === "lightning" || paymentType === "lnurl") {
        let feeProbeFailed = false

        if (sameNode || (isNoAmountInvoice && paymentAmount.amount === 0)) {
          return setFee({
            amount: { amount: 0, currency: walletDescriptor.currency },
            status: "set",
          })
        }

        try {
          setFee({
            status: "loading",
            amount: { amount: 0, currency: walletDescriptor.currency },
          })

          let feeValue: number
          if (isNoAmountInvoice) {
            const { data, errors } = await getNoAmountLightningFees({
              variables: {
                input: {
                  walletId: walletDescriptor.id,
                  paymentRequest: invoice,
                  amount: paymentAmount.amount,
                },
              },
            })

            feeValue =
              "lnNoAmountInvoiceFeeProbe" in data
                ? data.lnNoAmountInvoiceFeeProbe.amount
                : data.lnNoAmountUsdInvoiceFeeProbe.amount

            if (Boolean(errors?.length) && feeValue) {
              feeProbeFailed = true
            }
          } else {
            const { data, errors } = await getLightningFees({
              variables: {
                input: { walletId: walletDescriptor.id, paymentRequest: invoice },
              },
            })

            feeValue =
              "lnInvoiceFeeProbe" in data
                ? data.lnInvoiceFeeProbe.amount
                : data.lnUsdInvoiceFeeProbe.amount
            if (Boolean(errors?.length) && feeValue) {
              feeProbeFailed = true
            }
          }

          setFee({
            amount: { amount: feeValue, currency: walletDescriptor.currency },
            status: feeProbeFailed ? "error" : "set",
          })
        } catch (err) {
          crashlytics().recordError(err)
          console.debug({ err, message: "error getting lightning fees" })
          setFee({ status: "error" })
        }

        return
      }

      if (paymentType === "onchain") {
        if (paymentAmount.amount === 0) {
          return setFee({ status: "set" })
        }

        try {
          setFee({
            status: "loading",
            amount: { amount: 0, currency: walletDescriptor.currency },
          })
          const { data } = await onChainTxFee({
            variables: {
              walletId: walletDescriptor.id,
              address,
              amount: paymentAmount.amount,
            },
          })

          const feeValue = data.onChainTxFee.amount

          setFee({
            amount: { amount: feeValue, currency: walletDescriptor.currency },
            status: "set",
          })
        } catch (err) {
          crashlytics().recordError(err)
          console.debug({ err, message: "error getting onchains fees" })
          setFee({ status: "error" })
        }
      }
    }
    initializeFee()
    // TODO: rewrite this hook and correclty include all dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentType, invoice])

  return fee
}

export default useFee
