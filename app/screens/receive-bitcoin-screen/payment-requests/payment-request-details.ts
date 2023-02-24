import { GraphQlApplicationError, Network, WalletCurrency } from "@app/graphql/generated"
import {
  BtcPaymentAmount,
  MoneyAmount,
  PaymentAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"
import { WalletDescriptor } from "@app/types/wallets"
import { GraphQLError } from "graphql"
import {
  ConvertPaymentAmount,
  GeneratePaymentRequestResult,
  GqlGeneratePaymentRequestMutations,
  GqlGeneratePaymentRequestParams,
  GqlGeneratePaymentRequestResult,
  PaymentRequestAmountData,
  PaymentRequestDetails,
  PaymentRequest,
  LightningPaymentRequestData,
  PaymentRequestType,
} from "./index.types"
import { createPaymentRequest } from "./payment-request"

export type CreatePaymentRequestDetailsParams<V extends WalletCurrency> = {
  memo?: string
  unitOfAccountAmount?: MoneyAmount<WalletOrDisplayCurrency>
  paymentRequestType: PaymentRequestType
  receivingWalletDescriptor: WalletDescriptor<V>
  convertPaymentAmount: ConvertPaymentAmount
  bitcoinNetwork: Network
}

export const createPaymentRequestDetails = <V extends WalletCurrency>(
  params: CreatePaymentRequestDetailsParams<V>,
): PaymentRequestDetails<V> => {
  const {
    memo,
    unitOfAccountAmount,
    paymentRequestType,
    receivingWalletDescriptor,
    bitcoinNetwork,
    convertPaymentAmount,
  } = params

  let paymentRequestAmountData: PaymentRequestAmountData<V> = {}

  if (unitOfAccountAmount) {
    const settlementAmount = convertPaymentAmount(
      unitOfAccountAmount,
      receivingWalletDescriptor.currency,
    )
    paymentRequestAmountData = {
      unitOfAccountAmount,
      settlementAmount,
    }
  }

  const generatePaymentRequest = async (
    mutations: GqlGeneratePaymentRequestMutations,
  ): Promise<GeneratePaymentRequestResult> => {
    const { paymentRequestData, gqlErrors, applicationErrors } =
      await gqlGeneratePaymentRequest({
        memo,
        paymentRequestType,
        receivingWalletDescriptor,
        amount: paymentRequestAmountData.settlementAmount,
        mutations,
      })

    const paymentRequest = paymentRequestData
      ? createPaymentRequest({ paymentRequestData, network: bitcoinNetwork })
      : undefined

    return {
      gqlErrors: gqlErrors || [],
      applicationErrors: applicationErrors || [],
      paymentRequest,
    }
  }

  return {
    ...paymentRequestAmountData,
    paymentRequestType,
    memo,
    receivingWalletDescriptor,
    convertPaymentAmount,
    generatePaymentRequest,
  }
}

// throws if receivingWalletDescriptor.currency !== WalletCurrency.Btc and paymentRequestType === InvoiceType.Onchain
const gqlGeneratePaymentRequest = async <T extends WalletCurrency>({
  memo,
  paymentRequestType,
  receivingWalletDescriptor,
  amount,
  mutations,
}: GqlGeneratePaymentRequestParams<T>): Promise<GqlGeneratePaymentRequestResult> => {
  let gqlErrors: readonly GraphQLError[] | undefined = undefined
  let applicationErrors: readonly GraphQlApplicationError[] | undefined = undefined

  if (paymentRequestType === PaymentRequest.Lightning) {
    let paymentRequestData: LightningPaymentRequestData | undefined = undefined
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
        paymentRequestData = data?.lnInvoiceCreate?.invoice
          ? {
              ...data.lnInvoiceCreate.invoice,
              paymentRequestType: PaymentRequest.Lightning,
            }
          : undefined
        gqlErrors = errors
      } else {
        const { data, errors } = await mutations.lnUsdInvoiceCreate(lnAmountInput)
        applicationErrors = data?.lnUsdInvoiceCreate?.errors
        paymentRequestData = data?.lnUsdInvoiceCreate?.invoice
          ? {
              ...data.lnUsdInvoiceCreate.invoice,
              paymentRequestType: PaymentRequest.Lightning,
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
      paymentRequestData = data?.lnNoAmountInvoiceCreate?.invoice
        ? {
            ...data.lnNoAmountInvoiceCreate.invoice,
            paymentRequestType: PaymentRequest.Lightning,
          }
        : undefined
      gqlErrors = errors
    }
    return {
      paymentRequestData,
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

  const paymentRequestData = address
    ? {
        address,
        memo,
        amount,
        paymentRequestType: PaymentRequest.OnChain,
      }
    : undefined

  return {
    paymentRequestData,
    gqlErrors,
    applicationErrors,
  }
}

const isBtcPaymentAmount = (
  paymentAmount: PaymentAmount<WalletCurrency>,
): paymentAmount is BtcPaymentAmount => {
  return paymentAmount.currency === WalletCurrency.Btc
}
