import { WalletCurrency } from "@app/graphql/generated"
import { PaymentAmount } from "@app/types/amounts"
import { WalletDescriptor } from "@app/types/wallets"
import { CreateInvoiceDetailsParams } from "./invoices"
import {
  ConvertPaymentAmount,
  Invoice,
  InvoiceDetails,
  InvoiceType,
} from "./invoices/index.types"

export type UseReceiveBitcoinParams<V extends WalletCurrency> = {
  initialCreateInvoiceDetailsParams?: CreateInvoiceDetailsParams<V>
}

export const ReceiveBitcoinState = {
  Idle: "Idle",
  LoadingInvoice: "LoadingInvoice",
  InvoiceCreated: "InvoiceCreated",
  Error: "Error",
  Paid: "Paid",
  Expired: "Expired",
} as const

export const ErrorType = {
  Generic: "Generic",
}

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType]

export type InvoiceState<V extends WalletCurrency> =
  | {
      state: typeof ReceiveBitcoinState.Idle
      createInvoiceDetailsParams: CreateInvoiceDetailsParams<V> | undefined
      invoiceDetails: InvoiceDetails<V> | undefined
      invoice?: undefined
      error?: undefined
    }
  | {
      state: typeof ReceiveBitcoinState.LoadingInvoice
      createInvoiceDetailsParams: CreateInvoiceDetailsParams<V>
      invoiceDetails: InvoiceDetails<V>
      invoice?: undefined
      error?: undefined
    }
  | {
      state: typeof ReceiveBitcoinState.InvoiceCreated
      createInvoiceDetailsParams: CreateInvoiceDetailsParams<V>
      invoiceDetails: InvoiceDetails<V>
      invoice: Invoice
      error?: undefined
    }
  | {
      state: typeof ReceiveBitcoinState.Error
      createInvoiceDetailsParams: CreateInvoiceDetailsParams<V>
      invoiceDetails: InvoiceDetails<V>
      invoice?: undefined
      error: ErrorType
    }
  | {
      state: typeof ReceiveBitcoinState.Paid
      createInvoiceDetailsParams: CreateInvoiceDetailsParams<V>
      invoiceDetails: InvoiceDetails<V>
      invoice: Invoice
    }
  | {
      state: typeof ReceiveBitcoinState.Expired
      createInvoiceDetailsParams: CreateInvoiceDetailsParams<V>
      invoiceDetails: InvoiceDetails<V>
      invoice: Invoice
    }

export type ReceiveBitcoinState =
  (typeof ReceiveBitcoinState)[keyof typeof ReceiveBitcoinState]

export type UseReceiveBitcoinResult = {
  invoiceState: InvoiceState<WalletCurrency>
  setCreateInvoiceDetailsParams: (
    params: CreateInvoiceDetailsParams<WalletCurrency>,
  ) => void
  generateInvoice: (() => Promise<void>) | undefined
  generateInvoiceWithParams: (
    params: CreateInvoiceDetailsParams<WalletCurrency>,
  ) => Promise<void>
  checkExpiredAndGetRemainingSeconds:
    | ((currentTime: Date) => number | undefined)
    | undefined
} & (
  | {
      setAmount: (
        amount: PaymentAmount<WalletCurrency>,
        generateInvoiceAfter?: boolean,
      ) => void
      setMemo: (memo: string, generateInvoiceAfter?: boolean) => void
      setReceivingWalletDescriptor: (
        receivingWalletDescriptor: WalletDescriptor<WalletCurrency>,
        generateInvoiceAfter?: boolean,
      ) => void
      setInvoiceType: (invoiceType: InvoiceType, generateInvoiceAfter?: boolean) => void
      setConvertPaymentAmount: (
        convertPaymentAmount: ConvertPaymentAmount,
        generateInvoiceAfter?: boolean,
      ) => void
    }
  | {
      setAmount?: undefined
      setMemo?: undefined
      setReceivingWalletDescriptor?: undefined
      setInvoiceType?: undefined
      setConvertPaymentAmount?: undefined
    }
)
