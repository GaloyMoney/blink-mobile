// eslint-disable-next-line
// @ts-nocheck
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
import { GraphQLError } from "graphql"

type FeeType =
  | {
      status: "loading" | "error" | "unset"
      amount?: undefined
    }
  | {
      amount: PaymentAmount<WalletCurrency>
      status: "set"
    }
  | {
      amount?: PaymentAmount<WalletCurrency>
      status: "error"
    }

type UseFeeInput =
  | {
      walletDescriptor: WalletDescriptor<WalletCurrency>
      address: string
      paymentType: "onchain"
      isNoAmountInvoice?: undefined
      invoice?: undefined
      paymentAmount: PaymentAmount<WalletCurrency>
    }
  | {
      walletDescriptor: WalletDescriptor<WalletCurrency>
      address?: undefined
      isNoAmountInvoice: false
      invoice: string
      paymentType: "lightning" | "lnurl" | "intraledger"
      paymentAmount: PaymentAmount<WalletCurrency>
    }
  | {
      walletDescriptor: WalletDescriptor<WalletCurrency>
      address?: undefined
      isNoAmountInvoice: true
      invoice: string
      paymentType: "lightning" | "intraledger"
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

const useFee = ({
  walletDescriptor,
  paymentType,
  paymentAmount,
  isNoAmountInvoice,
  address,
  invoice,
}: UseFeeInput): FeeType => {
  const [fee, setFee] = useState<FeeType>({
    status: "unset",
  })

  const [lnInvoiceFeeProbe] = useLnInvoiceFeeProbeMutation()
  const [lnNoAmountInvoiceFeeProbe] = useLnNoAmountInvoiceFeeProbeMutation()
  const [lnUsdInvoiceFeeProbe] = useLnUsdInvoiceFeeProbeMutation()
  const [lnNoAmountUsdInvoiceFeeProbe] = useLnNoAmountUsdInvoiceFeeProbeMutation()
  const [onChainTxFee] = useOnChainTxFeeLazyQuery()

  useEffect(() => {
    const getFee = async () => {
      setFee({
        status: "loading",
      })

      const getLightningFees = async (invoice: string) => {
        if (walletDescriptor.currency === WalletCurrency.Btc) {
          const { data, errors } = await lnInvoiceFeeProbe({
            variables: {
              input: {
                walletId: walletDescriptor.id,
                paymentRequest: invoice,
              },
            },
          })
          return {
            amount: data?.lnInvoiceFeeProbe.amount,
            errors,
          }
        }
        const { data, errors } = await lnUsdInvoiceFeeProbe({
          variables: {
            input: {
              walletId: walletDescriptor.id,
              paymentRequest: invoice,
            },
          },
        })
        return {
          amount: data?.lnUsdInvoiceFeeProbe.amount,
          errors,
        }
      }

      const getNoAmountLightningFees = async (invoice: string, amount: number) => {
        if (walletDescriptor.currency === WalletCurrency.Btc) {
          const { data, errors } = await lnNoAmountInvoiceFeeProbe({
            variables: {
              input: {
                walletId: walletDescriptor.id,
                paymentRequest: invoice,
                amount,
              },
            },
          })
          return {
            amount: data?.lnNoAmountInvoiceFeeProbe.amount,
            errors,
          }
        }
        const { data, errors } = await lnNoAmountUsdInvoiceFeeProbe({
          variables: {
            input: {
              walletId: walletDescriptor.id,
              paymentRequest: invoice,
              amount,
            },
          },
        })
        return {
          amount: data?.lnNoAmountUsdInvoiceFeeProbe.amount,
          errors,
        }
      }

      const getOnChainFees = async (address: string, amount: number) => {
        const { data } = await onChainTxFee({
          variables: {
            walletId: walletDescriptor.id,
            address,
            amount,
          },
        })

        return {
          amount: data?.onChainTxFee.amount,
        }
      }

      try {
        let feeResponse: {
          amount: number | undefined | null
          errors?: readonly GraphQLError[] | undefined
        }

        switch (paymentType) {
          case "intraledger":
          case "lnurl":
          case "lightning":
            feeResponse = await (isNoAmountInvoice
              ? getLightningFees(invoice)
              : getNoAmountLightningFees(invoice, paymentAmount.amount))
            break
          case "onchain":
            feeResponse = await getOnChainFees(address, paymentAmount.amount)
            break
        }

        const feeAmount =
          typeof feeResponse.amount === "number"
            ? {
                amount: feeResponse.amount,
                currency: walletDescriptor.currency,
              }
            : undefined

        if (feeResponse.errors?.length || !feeAmount) {
          return setFee({
            status: "error",
            amount: feeAmount,
          })
        }

        return setFee({
          status: "set",
          amount: feeAmount,
        })
      } catch (e) {
        crashlytics().recordError(e)
        return setFee({
          status: "error",
        })
      }
    }

    getFee()
  }, [
    paymentType,
    paymentAmount,
    isNoAmountInvoice,
    address,
    invoice,
    setFee,
    lnInvoiceFeeProbe,
    lnNoAmountInvoiceFeeProbe,
    lnUsdInvoiceFeeProbe,
    lnNoAmountUsdInvoiceFeeProbe,
    onChainTxFee,
    walletDescriptor.currency,
    walletDescriptor.id,
  ])

  return fee
}

export default useFee
