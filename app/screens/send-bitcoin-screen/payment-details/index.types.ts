import {
  GraphQlApplicationError,
  IntraLedgerPaymentSendMutationHookResult,
  IntraLedgerUsdPaymentSendMutationHookResult,
  LnInvoicePaymentSendMutationHookResult,
  LnNoAmountInvoicePaymentSendMutationHookResult,
  LnNoAmountUsdInvoicePaymentSendMutationHookResult,
  OnChainPaymentSendMutationHookResult,
  PaymentSendResult,
  useLnInvoiceFeeProbeMutation,
  useLnNoAmountInvoiceFeeProbeMutation,
  useLnNoAmountUsdInvoiceFeeProbeMutation,
  useLnUsdInvoiceFeeProbeMutation,
  useOnChainTxFeeLazyQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { BtcPaymentAmount, PaymentAmount } from "@app/types/amounts"
import { WalletDescriptor } from "@app/types/wallets"
import { PaymentType } from "@galoymoney/client/dist/parsing-v2"
import { LnUrlPayServiceResponse } from "lnurl-pay/dist/types/types"

export type ConvertPaymentAmount = <T extends WalletCurrency>(
  paymentAmount: PaymentAmount<WalletCurrency>,
  toCurrency: T,
) => PaymentAmount<T>

export type BaseCreatePaymentDetailsParams<T extends WalletCurrency> = {
  convertPaymentAmount: ConvertPaymentAmount
  sendingWalletDescriptor: WalletDescriptor<T>
  destinationSpecifiedMemo?: string
  senderSpecifiedMemo?: string
}

export type SetSendingWalletDescriptor<T extends WalletCurrency> = (
  sendingWalletDescriptor: WalletDescriptor<T>,
) => PaymentDetail<T>

export type GetFeeParams = {
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

export type SendPaymentParams = {
  lnInvoicePaymentSend: LnInvoicePaymentSendMutationHookResult["0"]
  lnNoAmountInvoicePaymentSend: LnNoAmountInvoicePaymentSendMutationHookResult["0"]
  lnNoAmountUsdInvoicePaymentSend: LnNoAmountUsdInvoicePaymentSendMutationHookResult["0"]
  onChainPaymentSend: OnChainPaymentSendMutationHookResult["0"]
  intraLedgerPaymentSend: IntraLedgerPaymentSendMutationHookResult["0"]
  intraLedgerUsdPaymentSend: IntraLedgerUsdPaymentSendMutationHookResult["0"]
}

export type SendPayment = (sendPaymentFns: SendPaymentParams) => Promise<{
  status: PaymentSendResult | null | undefined
  errors?: readonly GraphQlApplicationError[]
}>

export type SetAmount<T extends WalletCurrency> = (
  unitOfAccountAmount: PaymentAmount<WalletCurrency>,
) => PaymentDetail<T>

export type SetMemo<T extends WalletCurrency> = (memo: string) => PaymentDetail<T>

export type SetInvoice<T extends WalletCurrency> = (params: {
  paymentRequest: string
  paymentRequestAmount: BtcPaymentAmount
}) => PaymentDetail<T>

type BasePaymentDetail<T extends WalletCurrency> = {
  memo?: string
  paymentType:
    | typeof PaymentType.Intraledger
    | typeof PaymentType.Onchain
    | typeof PaymentType.Lightning
    | typeof PaymentType.Lnurl
  destination: string
  sendingWalletDescriptor: WalletDescriptor<T>
  convertPaymentAmount: ConvertPaymentAmount
  setConvertPaymentAmount: (
    convertPaymentAmount: ConvertPaymentAmount,
  ) => PaymentDetail<T>
  setSendingWalletDescriptor: SetSendingWalletDescriptor<T>
  setMemo?: SetMemo<T>
  canSetMemo: boolean
  setAmount?: SetAmount<T>
  canSetAmount: boolean
  getFee?: GetFee<T>
  canGetFee: boolean
  sendPayment?: SendPayment
  canSendPayment: boolean
  destinationSpecifiedAmount?: PaymentAmount<"BTC">
  unitOfAccountAmount: PaymentAmount<WalletCurrency> // destinationSpecifiedAmount if the invoice has an amount, otherwise the amount that the user is denominating the payment in
  settlementAmount: PaymentAmount<T> // the amount that will be subtracted from the sending wallet
  settlementAmountIsEstimated: boolean
}

// memo is defined if canSetMemo is true
export type PaymentDetailSetMemo<T extends WalletCurrency> =
  | {
      setMemo: SetMemo<T>
      canSetMemo: true
    }
  | {
      setMemo?: undefined
      canSetMemo: false
    }

// invoices with amounts cannot set amounts
export type PaymentDetailSetAmount<T extends WalletCurrency> =
  | {
      setAmount: SetAmount<T>
      canSetAmount: true
    }
  | {
      setAmount?: undefined
      canSetAmount: false
      destinationSpecifiedAmount: PaymentAmount<"BTC"> // the amount that comes from the destination
    }

// sendPayment and getFee are defined together
export type PaymentDetailSendPaymentGetFee<T extends WalletCurrency> =
  | {
      sendPayment: SendPayment
      canSendPayment: true
      getFee: GetFee<T>
      canGetFee: true
    }
  | {
      sendPayment?: undefined
      canSendPayment: false
      getFee?: undefined
      canGetFee: false
    }

// lnurl has specific properties
type LnurlSpecificProperties<T extends WalletCurrency> =
  | {
      paymentType:
        | typeof PaymentType.Lightning
        | typeof PaymentType.Intraledger
        | typeof PaymentType.Onchain
    }
  | {
      paymentType: typeof PaymentType.Lnurl
      lnurlParams: LnUrlPayServiceResponse
      setInvoice: SetInvoice<T>
    }

// combine all rules together with base type
export type PaymentDetail<T extends WalletCurrency> = BasePaymentDetail<T> &
  LnurlSpecificProperties<T> &
  PaymentDetailSetMemo<T> &
  PaymentDetailSetAmount<T> &
  PaymentDetailSendPaymentGetFee<T>
