import {
  GraphQlApplicationError,
  LnInvoice,
  LnNoAmountInvoice,
  Network,
  useLnInvoiceCreateMutation,
  useLnNoAmountInvoiceCreateMutation,
  useLnUsdInvoiceCreateMutation,
  useOnChainAddressCurrentMutation,
  WalletCurrency,
} from "@app/graphql/generated"
import { BtcPaymentAmount, PaymentAmount } from "@app/types/amounts"
import { WalletDescriptor } from "@app/types/wallets"
import { GraphQLError } from "graphql"

export type CreateInvoiceParams = {
  invoiceData: InvoiceData
  network: Network
}

export type Invoice = {
  expiration?: Date
  getFullUri: GetFullUriFn
  invoiceDisplay: string // what is displayed to the user
  invoiceData: LightningInvoiceData | OnChainInvoiceData | undefined
}

export type GetFullUriFn = (params: { uppercase?: boolean; prefix?: boolean }) => string

export type InvoiceDetails<V extends WalletCurrency> = {
  unitOfAccountAmount?: PaymentAmount<WalletCurrency> // amount the user wants to receive in the currency that they think in
  settlementAmount?: PaymentAmount<V> // amount in the currency of the receiving wallet
  convertPaymentAmount: ConvertPaymentAmount
  receivingWalletDescriptor: WalletDescriptor<V>
  memo?: string
  invoiceType: InvoiceType
  generateInvoice: (
    mutations: GqlGenerateInvoiceMutations,
  ) => Promise<GenerateInvoiceResult>
} & InvoiceAmountData<V>

export type GenerateInvoiceResult = {
  invoice?: Invoice
  gqlErrors: readonly GraphQLError[]
  applicationErrors: readonly GraphQlApplicationError[]
}

export const InvoiceType = {
  Lightning: "Lightning",
  OnChain: "OnChain",
} as const

export type InvoiceType = (typeof InvoiceType)[keyof typeof InvoiceType]

export type ConvertPaymentAmount = <T extends WalletCurrency>(
  paymentAmount: PaymentAmount<WalletCurrency>,
  toCurrency: T,
) => PaymentAmount<T>

// Rule that ensures amount are either all undefined or all defined
export type InvoiceAmountData<T extends WalletCurrency> =
  | {
      unitOfAccountAmount: PaymentAmount<WalletCurrency>
      settlementAmount: PaymentAmount<T>
    }
  | {
      unitOfAccountAmount?: undefined
      settlementAmount?: undefined
    }

export type GqlGenerateInvoiceParams<T extends WalletCurrency> = {
  mutations: GqlGenerateInvoiceMutations
  memo?: string
  invoiceType: InvoiceType
  receivingWalletDescriptor: WalletDescriptor<T>
  amount?: PaymentAmount<T>
}

export type GqlGenerateInvoiceMutations = {
  lnNoAmountInvoiceCreate: ReturnType<typeof useLnNoAmountInvoiceCreateMutation>["0"]
  lnInvoiceCreate: ReturnType<typeof useLnInvoiceCreateMutation>["0"]
  lnUsdInvoiceCreate: ReturnType<typeof useLnUsdInvoiceCreateMutation>["0"]
  onChainAddressCurrent: ReturnType<typeof useOnChainAddressCurrentMutation>["0"]
}

export type GqlGenerateInvoiceResult = {
  gqlErrors: readonly GraphQLError[] | undefined
  applicationErrors: readonly GraphQlApplicationError[] | undefined
  invoice: InvoiceData | undefined
}

export type InvoiceData = LightningInvoiceData | OnChainInvoiceData

export type LightningInvoiceData = (LnInvoice | LnNoAmountInvoice) & {
  invoiceType: typeof InvoiceType.Lightning
}

export type OnChainInvoiceData = {
  address: string
  amount?: BtcPaymentAmount | undefined
  memo?: string
  invoiceType: typeof InvoiceType.OnChain
}
