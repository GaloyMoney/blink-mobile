import { QUERIES, useMutation } from "@galoymoney/client"
import { useState, useEffect } from "react"
import { useApolloClient } from "@apollo/client"
import { WalletDescriptor } from "@app/types/wallets"
import { PaymentAmount, WalletCurrency } from "@app/types/amounts"

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

const useFee = ({
  walletDescriptor,
  address,
  isNoAmountInvoice,
  invoice,
  paymentType,
  sameNode,
  paymentAmount,
}: UseFeeInput): FeeType => {
  const client = useApolloClient()

  const [fee, setFee] = useState<FeeType>({
    status: "unset",
  })

  const [lnInvoiceFeeProbe] = useMutation.lnInvoiceFeeProbe()
  const [lnNoAmountInvoiceFeeProbe] = useMutation.lnNoAmountInvoiceFeeProbe()
  const [lnUsdInvoiceFeeProbe] = useMutation.lnUsdInvoiceFeeProbe()
  const [lnNoAmountUsdInvoiceFeeProbe] = useMutation.lnNoAmountUsdInvoiceFeeProbe()

  const getLightningFees =
    walletDescriptor.currency === WalletCurrency.BTC
      ? lnInvoiceFeeProbe
      : lnUsdInvoiceFeeProbe

  const getNoAmountLightningFees =
    walletDescriptor.currency === WalletCurrency.BTC
      ? lnNoAmountInvoiceFeeProbe
      : lnNoAmountUsdInvoiceFeeProbe

  useEffect(() => {
    const initializeFee = async () => {
      if (paymentType === "lightning" || paymentType === "lnurl") {
        if (sameNode) {
          return setFee({
            amount: {
              amount: 0,
              currency: walletDescriptor.currency,
            },
            status: "set",
          })
        }

        if (isNoAmountInvoice && paymentAmount.amount === 0) {
          return setFee({
            amount: {
              amount: 0,
              currency: walletDescriptor.currency,
            },
            status: "set",
          })
        }

        try {
          setFee({
            status: "loading",
          })

          let feeValue: number
          if (isNoAmountInvoice) {
            const { data, errorsMessage } = await getNoAmountLightningFees({
              variables: {
                input: {
                  walletId: walletDescriptor.id,
                  paymentRequest: invoice,
                  amount: paymentAmount.amount,
                },
              },
            })
            if (errorsMessage) {
              throw new Error("Error returned from API while calculating fee.")
            }
            feeValue =
              "lnNoAmountInvoiceFeeProbe" in data
                ? data.lnNoAmountInvoiceFeeProbe.amount
                : data.lnNoAmountUsdInvoiceFeeProbe.amount
          } else {
            const { data, errorsMessage } = await getLightningFees({
              variables: {
                input: { walletId: walletDescriptor.id, paymentRequest: invoice },
              },
            })

            if (errorsMessage) {
              throw new Error("Error returned from API while calculating fee.")
            }

            feeValue =
              "lnInvoiceFeeProbe" in data
                ? data.lnInvoiceFeeProbe.amount
                : data.lnUsdInvoiceFeeProbe.amount
          }

          setFee({
            amount: {
              amount: feeValue,
              currency: walletDescriptor.currency,
            },
            status: "set",
          })
        } catch (err) {
          console.debug({ err, message: "error getting lightning fees" })
          setFee({
            status: "error",
          })
        }

        return
      }

      if (paymentType === "onchain") {
        if (paymentAmount.amount === 0) {
          return setFee({
            status: "set",
          })
        }

        try {
          setFee({
            status: "loading",
          })

          const { data } = await client.query({
            query: QUERIES.onChainTxFee,
            variables: {
              walletId: walletDescriptor.id,
              address,
              amount: paymentAmount.amount,
            },
            fetchPolicy: "no-cache",
          })
          const feeValue = data.onChainTxFee.amount

          setFee({
            amount: {
              amount: feeValue,
              currency: walletDescriptor.currency,
            },
            status: "set",
          })
        } catch (err) {
          console.debug({ err, message: "error getting onchains fees" })
          setFee({
            status: "error",
          })
        }
      }
    }
    initializeFee()
  }, [invoice, paymentAmount.amount])

  return fee
}

export default useFee
