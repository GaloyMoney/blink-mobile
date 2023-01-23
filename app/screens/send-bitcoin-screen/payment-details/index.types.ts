import {
  GraphQlApplicationError,
  PaymentSendResult,
  useIntraLedgerPaymentSendMutation,
  useIntraLedgerUsdPaymentSendMutation,
  useLnInvoiceFeeProbeMutation,
  useLnInvoicePaymentSendMutation,
  useLnNoAmountInvoiceFeeProbeMutation,
  useLnNoAmountInvoicePaymentSendMutation,
  useLnNoAmountUsdInvoiceFeeProbeMutation,
  useLnNoAmountUsdInvoicePaymentSendMutation,
  useLnUsdInvoiceFeeProbeMutation,
  useOnChainPaymentSendMutation,
  useOnChainTxFeeLazyQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { BtcPaymentAmount, PaymentAmount } from "@app/types/amounts"
import { WalletDescriptor } from "@app/types/wallets"
import { LnUrlPayServiceResponse } from "lnurl-pay/dist/types/types"

export type ConvertPaymentAmount = <T extends WalletCurrency>(
  paymentAmount: PaymentAmount<WalletCurrency>,
  toCurrency: T,
) => PaymentAmount<T>

export type BaseCreatePaymentDetailsParams<T extends WalletCurrency> = {
  convertPaymentAmount: ConvertPaymentAmount
  sendingWalletDescriptor?: WalletDescriptor<T>
  destinationSpecifiedMemo?: string
  senderSpecifiedMemo?: string
}

export type SetSendingWalletDescriptor<T extends WalletCurrency> = (
  sendingWalletDescriptor: WalletDescriptor<T>,
) => PaymentDetail<T>

export type SetUnitOfAccount<T extends WalletCurrency> = (
  unitOfAccount: WalletCurrency,
) => PaymentDetail<T>

type GetFeeParams = {
  lnInvoiceFeeProbe: ReturnType<typeof useLnInvoiceFeeProbeMutation>["0"]
  lnNoAmountInvoiceFeeProbe: ReturnType<typeof useLnNoAmountInvoiceFeeProbeMutation>["0"]
  lnNoAmountUsdInvoiceFeeProbe: ReturnType<
    typeof useLnNoAmountUsdInvoiceFeeProbeMutation
  >["0"]
  lnUsdInvoiceFeeProbe: ReturnType<typeof useLnUsdInvoiceFeeProbeMutation>["0"]
  onChainTxFee: ReturnType<typeof useOnChainTxFeeLazyQuery>["0"]
}

export type GetFee<T extends WalletCurrency> = (getFeeFns: GetFeeParams) => Promise<{
  amount?: PaymentAmount<T> | null | undefined
  errors?: readonly GraphQlApplicationError[]
}>

type SendPaymentParams = {
  lnInvoicePaymentSend: ReturnType<typeof useLnInvoicePaymentSendMutation>["0"]
  lnNoAmountInvoicePaymentSend: ReturnType<
    typeof useLnNoAmountInvoicePaymentSendMutation
  >["0"]
  lnNoAmountUsdInvoicePaymentSend: ReturnType<
    typeof useLnNoAmountUsdInvoicePaymentSendMutation
  >["0"]
  onChainPaymentSend: ReturnType<typeof useOnChainPaymentSendMutation>["0"]
  intraLedgerPaymentSend: ReturnType<typeof useIntraLedgerPaymentSendMutation>["0"]
  intraLedgerUsdPaymentSend: ReturnType<typeof useIntraLedgerUsdPaymentSendMutation>["0"]
}

export type SendPayment = (sendPaymentFns: SendPaymentParams) => Promise<{
  status: PaymentSendResult | null | undefined
  errors?: readonly GraphQlApplicationError[]
}>

export type SetAmount<T extends WalletCurrency> = (
  unitOfAccountAmount: PaymentAmount<WalletCurrency>,
) => PaymentDetail<T>

export type SetMemo<T extends WalletCurrency> = (memo: string) => PaymentDetail<T>

type BasePaymentDetail<T extends WalletCurrency> = {
  memo?: string
  destination: string
  convertPaymentAmount: ConvertPaymentAmount
  sendingWalletDescriptor?: WalletDescriptor<T>
  setConvertPaymentAmount: (
    convertPaymentAmount: ConvertPaymentAmount,
  ) => PaymentDetail<T>
  setUnitOfAccount: SetUnitOfAccount<T>
  setSendingWalletDescriptor: SetSendingWalletDescriptor<T>
  setMemo: SetMemo<T> | null
  setAmount: SetAmount<T> | null
  getFee?: GetFee<T>
  sendPayment?: SendPayment
  destinationSpecifiedAmount?: PaymentAmount<"BTC"> | null
  settlementAmount?: PaymentAmount<T>
  settlementAmountIsEstimated?: boolean
  unitOfAccountAmount?: PaymentAmount<WalletCurrency>
}

export type SetInvoice<T extends WalletCurrency> = (params: {
  paymentRequest: string
  paymentRequestAmount: BtcPaymentAmount
}) => PaymentDetail<T>

type PaymentTypeData<T extends WalletCurrency> =
  | {
      paymentType: "lightning" | "onchain" | "intraledger"
    }
  | {
      paymentType: "lnurl"
      lnurlParams: LnUrlPayServiceResponse
      setInvoice: SetInvoice<T>
    }

export type PaymentDetail<T extends WalletCurrency> = BasePaymentDetail<T> &
  PaymentTypeData<T>
