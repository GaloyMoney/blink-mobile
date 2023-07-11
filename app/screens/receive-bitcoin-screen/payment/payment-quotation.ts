import { WalletCurrency } from "@app/graphql/generated"
import {
  CreatePaymentQuotationParams,
  GetFullUriFn,
  Invoice,
  PaymentQuotation,
  PaymentQuotationState,
  PaymentQuotationStateType,
  PaymentQuote,
} from "./index.types"
import { decodeInvoiceString, Network as NetworkLibGaloy } from "@galoymoney/client"
import { BtcMoneyAmount } from "@app/types/amounts"
import { getPaymentRequestFullUri } from "./helpers"

export const createPaymentQuotation = (
  params: CreatePaymentQuotationParams,
): PaymentQuotation => {
  let { state, quote } = params
  if (!state) state = PaymentQuotationState.Idle

  const setState = (state: PaymentQuotationStateType) => {
    if (state === PaymentQuotationState.Loading)
      return createPaymentQuotation({ ...params, state, quote: undefined })
    return createPaymentQuotation({ ...params, state })
  }

  // The hook should setState(Loading) before calling this
  const generateQuote: () => Promise<PaymentQuotation> = async () => {
    const { paymentRequest: pr, mutations } = params

    let quote: PaymentQuote | undefined

    // On Chain BTC
    if (pr.type === Invoice.OnChain) {
      const { data, errors } = await mutations.onChainAddressCurrent({
        variables: { input: { walletId: pr.receivingWalletDescriptor.id } },
      })

      if (pr.settlementAmount && pr.settlementAmount.currency !== WalletCurrency.Btc)
        throw new Error("On-chain invoices only support BTC")

      const address = data?.onChainAddressCurrent?.address || undefined

      const getFullUriFn: GetFullUriFn = ({ uppercase, prefix }) =>
        getPaymentRequestFullUri({
          type: Invoice.OnChain,
          input: address || "",
          amount: pr.settlementAmount?.amount,
          memo: pr.memo,
          uppercase,
          prefix,
        })

      quote = {
        data: address
          ? {
              invoiceType: Invoice.OnChain,
              getFullUriFn,
              address,
              amount: pr.settlementAmount as BtcMoneyAmount,
              memo: pr.memo,
            }
          : undefined,
        applicationErrors: data?.onChainAddressCurrent?.errors,
        gqlErrors: errors,
      }

      // Lightning without Amount
    } else if (pr.type === Invoice.Lightning && pr.unitOfAccountAmount === undefined) {
      const { data, errors } = await mutations.lnNoAmountInvoiceCreate({
        variables: {
          input: {
            walletId: pr.receivingWalletDescriptor.id,
            memo: pr.memo,
          },
        },
      })

      const dateString = decodeInvoiceString(
        data?.lnNoAmountInvoiceCreate.invoice?.paymentRequest ?? "",
        pr.network as NetworkLibGaloy,
      ).timeExpireDateString

      const getFullUriFn: GetFullUriFn = ({ uppercase, prefix }) =>
        getPaymentRequestFullUri({
          type: Invoice.Lightning,
          input: data?.lnNoAmountInvoiceCreate.invoice?.paymentRequest || "",
          amount: pr.settlementAmount?.amount,
          memo: pr.memo,
          uppercase,
          prefix,
        })

      quote = {
        data: data?.lnNoAmountInvoiceCreate.invoice
          ? {
              invoiceType: Invoice.Lightning,
              ...data?.lnNoAmountInvoiceCreate.invoice,
              expiresAt: dateString ? new Date(dateString) : undefined,
              getFullUriFn,
            }
          : undefined,
        applicationErrors: data?.lnNoAmountInvoiceCreate?.errors,
        gqlErrors: errors,
      }

      // Lightning with BTC Amount
    } else if (
      pr.type === Invoice.Lightning &&
      pr.unitOfAccountAmount?.currency === WalletCurrency.Btc &&
      pr.settlementAmount?.amount
    ) {
      const { data, errors } = await mutations.lnInvoiceCreate({
        variables: {
          input: {
            walletId: pr.receivingWalletDescriptor.id,
            amount: pr.settlementAmount?.amount,
            memo: pr.memo,
          },
        },
      })

      const dateString = decodeInvoiceString(
        data?.lnInvoiceCreate.invoice?.paymentRequest ?? "",
        pr.network as NetworkLibGaloy,
      ).timeExpireDateString

      const getFullUriFn: GetFullUriFn = ({ uppercase, prefix }) =>
        getPaymentRequestFullUri({
          type: Invoice.Lightning,
          input: data?.lnInvoiceCreate.invoice?.paymentRequest || "",
          amount: pr.settlementAmount?.amount,
          memo: pr.memo,
          uppercase,
          prefix,
        })

      quote = {
        data: data?.lnInvoiceCreate.invoice
          ? {
              invoiceType: Invoice.Lightning,
              ...data?.lnInvoiceCreate.invoice,
              expiresAt: dateString ? new Date(dateString) : undefined,
              getFullUriFn,
            }
          : undefined,
        applicationErrors: data?.lnInvoiceCreate?.errors,
        gqlErrors: errors,
      }
      // Lightning with USD Amount
    } else if (
      pr.type === Invoice.Lightning &&
      pr.unitOfAccountAmount?.currency === WalletCurrency.Usd &&
      pr.settlementAmount?.amount
    ) {
      const { data, errors } = await mutations.lnUsdInvoiceCreate({
        variables: {
          input: {
            walletId: pr.receivingWalletDescriptor.id,
            amount: pr.settlementAmount?.amount,
            memo: pr.memo,
          },
        },
      })

      const dateString = decodeInvoiceString(
        data?.lnUsdInvoiceCreate.invoice?.paymentRequest ?? "",
        pr.network as NetworkLibGaloy,
      ).timeExpireDateString

      const getFullUriFn: GetFullUriFn = ({ uppercase, prefix }) =>
        getPaymentRequestFullUri({
          type: Invoice.Lightning,
          input: data?.lnUsdInvoiceCreate.invoice?.paymentRequest || "",
          amount: pr.settlementAmount?.amount,
          memo: pr.memo,
          uppercase,
          prefix,
        })

      quote = {
        data: data?.lnUsdInvoiceCreate.invoice
          ? {
              invoiceType: Invoice.Lightning,
              ...data?.lnUsdInvoiceCreate.invoice,
              expiresAt: dateString ? new Date(dateString) : undefined,
              getFullUriFn,
            }
          : undefined,
        applicationErrors: data?.lnUsdInvoiceCreate?.errors,
        gqlErrors: errors,
      }

      // Paycode
    } else if (pr.type === Invoice.PayCode && pr.username) {
      const getFullUriFn: GetFullUriFn = ({ uppercase, prefix }) =>
        getPaymentRequestFullUri({
          type: Invoice.PayCode,
          input: pr.username || "",
          uppercase,
          prefix,
        })

      quote = {
        data: {
          invoiceType: Invoice.PayCode,
          username: pr.username,
          getFullUriFn,
        },
        applicationErrors: undefined,
        gqlErrors: undefined,
      }
    } else {
      quote = undefined
      throw new Error("Unknown Payment Request Type Encountered - Please Report")
    }

    let state: PaymentQuotationStateType = PaymentQuotationState.Created
    if (
      !quote ||
      quote.applicationErrors?.length ||
      quote.gqlErrors?.length ||
      !quote.data
    ) {
      state = PaymentQuotationState.Error
    }

    return createPaymentQuotation({ ...params, quote, state })
  }

  return { ...params, state, quote, generateQuote, setState }
}
