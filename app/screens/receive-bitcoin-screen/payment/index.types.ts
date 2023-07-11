/**
 * Domain Nomenclature:
 * -------------------
 * PaymentRequest - Clientside request for a generated quote
 * PaymentQuotation - Generated quotation which contains the finalized invoice data
 * Invoice - (not specific to LN) The quoted invoice that contains invoice type specific data
 */

import { LnInvoice, LnNoAmountInvoice, WalletCurrency } from "@app/graphql/generated"
import {
  BtcMoneyAmount,
  MoneyAmount,
  WalletAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"
import { ConvertMoneyAmount } from "@app/screens/send-bitcoin-screen/payment-details"
import { WalletDescriptor } from "@app/types/wallets"

/* Stores clientside details and instructions to be sent to the server and generate a PaymentQuotation */
export type PaymentRequest<T extends WalletCurrency> = BasePaymentRequest<T>

type BasePaymentRequest<T extends WalletCurrency> = {
  // Invoice Type
  type: InvoiceType
  setType: (type: InvoiceType) => PaymentRequest<T>

  // Default Wallet Descriptor
  defaultWalletDescriptor: WalletDescriptor<T>
  setDefaultWalletDescriptor: (
    defaultWalletDescriptor: WalletDescriptor<T>,
  ) => PaymentRequest<T>

  // Recieve in which wallet information
  receivingWalletDescriptor: WalletDescriptor<T>
  canSetReceivingWalletDescriptor: boolean
  setReceivingWalletDescriptor?: (
    receivingWalletDescriptor: WalletDescriptor<T>,
  ) => PaymentRequest<T>

  // Memo
  canSetMemo: boolean
  memo?: string
  setMemo?: (memo: string) => PaymentRequest<T>

  // Amount
  canSetAmount: boolean
  setAmount?: (
    unitOfAccountAmount: MoneyAmount<WalletOrDisplayCurrency>,
  ) => PaymentRequest<T>
  unitOfAccountAmount?: MoneyAmount<WalletOrDisplayCurrency>
  settlementAmount?: WalletAmount<T>

  // For money conversion in case amount is given
  convertMoneyAmount: ConvertMoneyAmount
  setConvertMoneyAmount: (convertMoneyAmount: ConvertMoneyAmount) => PaymentRequest<T>
}

export type BaseCreatePaymentRequestParams<T extends WalletCurrency> = {
  type: InvoiceType
  defaultWalletDescriptor: WalletDescriptor<T>
  convertMoneyAmount: ConvertMoneyAmount
}

export type InternalCreatePaymentRequestParams<
  T extends WalletCurrency
> = BaseCreatePaymentRequestParams<T> & {
  receivingWalletDescriptor?: WalletDescriptor<T>
  memo?: string
  unitOfAccountAmount?: MoneyAmount<WalletOrDisplayCurrency>
}

/* Has immutable payment quotation from the server and handles payment state for itself (via hook) */
export type PaymentQuotation = {}

/* Invoice */
export const Invoice = {
  Lightning: "Lightning",
  OnChain: "OnChain",
  PayCode: "PayCode",
} as const
export type InvoiceType = typeof Invoice[keyof typeof Invoice]

/* Invoice Data */
export type InvoiceData = LightningInvoiceData | OnChainInvoiceData | PayCodeInvoiceData
export type LightningInvoiceData = (LnInvoice | LnNoAmountInvoice) & {
  invoiceType: typeof Invoice.Lightning
  memo?: string
}
export type OnChainInvoiceData = {
  invoiceType: typeof Invoice.OnChain
  address: string
  amount?: BtcMoneyAmount | undefined
  memo?: string
}
export type PayCodeInvoiceData = {
  invoiceType: typeof Invoice.PayCode
  username: string
}

export type ConvertMoneyAmountFn = ConvertMoneyAmount
