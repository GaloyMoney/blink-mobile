import { GraphQlApplicationError, Network, WalletCurrency } from "@app/graphql/generated"
import { BtcPaymentAmount, PaymentAmount } from "@app/types/amounts"
import { WalletDescriptor } from "@app/types/wallets"
import { GraphQLError } from "graphql"
import {
  ConvertPaymentAmount,
  GenerateInvoiceResult,
  GqlGenerateInvoiceMutations,
  GqlGenerateInvoiceParams,
  GqlGenerateInvoiceResult,
  InvoiceAmountData,
  InvoiceDetails,
  InvoiceType,
  LightningInvoiceData,
} from "./index.types"
import { createInvoice } from "./invoice"

export type CreateInvoiceDetailsParams<V extends WalletCurrency> = {
  memo?: string
  unitOfAccountAmount?: PaymentAmount<WalletCurrency>
  invoiceType: InvoiceType
  receivingWalletDescriptor: WalletDescriptor<V>
  convertPaymentAmount: ConvertPaymentAmount
  bitcoinNetwork: Network
}

export const createInvoiceDetails = <V extends WalletCurrency>(
  params: CreateInvoiceDetailsParams<V>,
): InvoiceDetails<V> => {
  const {
    memo,
    unitOfAccountAmount,
    invoiceType,
    receivingWalletDescriptor,
    bitcoinNetwork,
    convertPaymentAmount,
  } = params

  let invoiceAmountData: InvoiceAmountData<V> = {}

  if (unitOfAccountAmount) {
    const settlementAmount = convertPaymentAmount(
      unitOfAccountAmount,
      receivingWalletDescriptor.currency,
    )
    invoiceAmountData = {
      unitOfAccountAmount,
      settlementAmount,
    }
  }

  const generateInvoice = async (
    mutations: GqlGenerateInvoiceMutations,
  ): Promise<GenerateInvoiceResult> => {
    const {
      invoice: invoiceData,
      gqlErrors,
      applicationErrors,
    } = await gqlGenerateInvoice({
      memo,
      invoiceType,
      receivingWalletDescriptor,
      amount: invoiceAmountData.settlementAmount,
      mutations,
    })

    const invoice = invoiceData
      ? createInvoice({ invoiceData, network: bitcoinNetwork })
      : undefined

    return {
      gqlErrors: gqlErrors || [],
      applicationErrors: applicationErrors || [],
      invoice,
    }
  }

  return {
    ...invoiceAmountData,
    invoiceType,
    memo,
    receivingWalletDescriptor,
    convertPaymentAmount,
    generateInvoice,
  }
}

export const gqlGenerateInvoice = async <T extends WalletCurrency>({
  memo,
  invoiceType,
  receivingWalletDescriptor,
  amount,
  mutations,
}: GqlGenerateInvoiceParams<T>): Promise<GqlGenerateInvoiceResult> => {
  let gqlErrors: readonly GraphQLError[] | undefined = undefined
  let applicationErrors: readonly GraphQlApplicationError[] | undefined = undefined

  if (invoiceType === InvoiceType.Lightning) {
    let invoice: LightningInvoiceData | undefined = undefined
    if (amount && amount.amount) {
      const lnAmountInput = {
        variables: {
          input: {
            amount: amount.amount,
            walletId: receivingWalletDescriptor.id,
            memo,
          },
        },
      }

      if (receivingWalletDescriptor.currency === WalletCurrency.Btc) {
        const { errors, data } = await mutations.lnInvoiceCreate(lnAmountInput)
        applicationErrors = data?.lnInvoiceCreate?.errors
        invoice = data?.lnInvoiceCreate?.invoice
          ? {
              ...data.lnInvoiceCreate.invoice,
              invoiceType: InvoiceType.Lightning,
            }
          : undefined
        gqlErrors = errors
      } else {
        const { data, errors } = await mutations.lnUsdInvoiceCreate(lnAmountInput)
        applicationErrors = data?.lnUsdInvoiceCreate?.errors
        invoice = data?.lnUsdInvoiceCreate?.invoice
          ? {
              ...data.lnUsdInvoiceCreate.invoice,
              invoiceType: InvoiceType.Lightning,
            }
          : undefined
        gqlErrors = errors
      }
    } else {
      const lnNoAmountInput = {
        variables: {
          input: {
            walletId: receivingWalletDescriptor.id,
            memo,
          },
        },
      }
      const { data, errors } = await mutations.lnNoAmountInvoiceCreate(lnNoAmountInput)

      applicationErrors = data?.lnNoAmountInvoiceCreate?.errors
      invoice = data?.lnNoAmountInvoiceCreate?.invoice
        ? {
            ...data.lnNoAmountInvoiceCreate.invoice,
            invoiceType: InvoiceType.Lightning,
          }
        : undefined
      gqlErrors = errors
    }
    return {
      invoice,
      gqlErrors,
      applicationErrors,
    }
  }

  const { data, errors } = await mutations.onChainAddressCurrent({
    variables: {
      input: {
        walletId: receivingWalletDescriptor.id,
      },
    },
  })

  applicationErrors = data?.onChainAddressCurrent?.errors
  const address = data?.onChainAddressCurrent?.address || undefined
  gqlErrors = errors

  if (amount && !isBtcPaymentAmount(amount)) {
    throw new Error("On-chain invoices only support BTC")
  }

  const invoice = address
    ? {
        address,
        memo,
        amount,
        invoiceType: InvoiceType.OnChain,
      }
    : undefined

  return {
    invoice,
    gqlErrors,
    applicationErrors,
  }
}

const isBtcPaymentAmount = (
  paymentAmount: PaymentAmount<WalletCurrency>,
): paymentAmount is BtcPaymentAmount => {
  return paymentAmount.currency === WalletCurrency.Btc
}
