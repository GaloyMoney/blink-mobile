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
import {
  BtcMoneyAmount,
  WalletOrDisplayCurrency,
  MoneyAmount,
  WalletAmount,
} from "@app/types/amounts"
import { WalletDescriptor } from "@app/types/wallets"
import { GraphQLError } from "graphql"

export type CreatePaymentRequestParams = {
  paymentRequestData: PaymentRequestData
  network: Network
}

export type PaymentRequest = {
  expiration?: Date
  getFullUri: GetFullUriFn
  paymentRequestDisplay: string // what is displayed to the user
  paymentRequestData: LightningPaymentRequestData | OnChainPaymentRequestData | undefined
}

export type GetFullUriFn = (params: { uppercase?: boolean; prefix?: boolean }) => string

export type PaymentRequestDetails<W extends WalletCurrency> = {
  unitOfAccountAmount?: MoneyAmount<WalletOrDisplayCurrency> // amount in the currency that the user denominates the payment in
  settlementAmount?: WalletAmount<W> // amount in the currency of the receiving wallet
  convertMoneyAmount: ConvertMoneyAmount
  receivingWalletDescriptor: WalletDescriptor<W>
  memo?: string
  paymentRequestType: PaymentRequestType
  generatePaymentRequest: (
    mutations: GqlGeneratePaymentRequestMutations,
  ) => Promise<GeneratePaymentRequestResult>
} & PaymentRequestAmountData<W>

export type GeneratePaymentRequestResult = {
  paymentRequest?: PaymentRequest
  gqlErrors: readonly GraphQLError[]
  applicationErrors: readonly GraphQlApplicationError[]
}

export const PaymentRequest = {
  Lightning: "Lightning",
  OnChain: "OnChain",
} as const

export type PaymentRequestType = (typeof PaymentRequest)[keyof typeof PaymentRequest]

export type ConvertMoneyAmount = <W extends WalletOrDisplayCurrency>(
  moneyAmount: MoneyAmount<WalletOrDisplayCurrency>,
  toCurrency: W,
) => MoneyAmount<W>

// Rule that ensures amount are either all undefined or all defined
export type PaymentRequestAmountData<W extends WalletCurrency> =
  | {
      unitOfAccountAmount: MoneyAmount<WalletOrDisplayCurrency>
      settlementAmount: WalletAmount<W>
    }
  | {
      unitOfAccountAmount?: undefined
      settlementAmount?: undefined
    }

export type GqlGeneratePaymentRequestParams<W extends WalletCurrency> = {
  mutations: GqlGeneratePaymentRequestMutations
  memo?: string
  paymentRequestType: PaymentRequestType
  receivingWalletDescriptor: WalletDescriptor<W>
  amount?: WalletAmount<W>
}

export type GqlGeneratePaymentRequestMutations = {
  lnNoAmountInvoiceCreate: ReturnType<typeof useLnNoAmountInvoiceCreateMutation>["0"]
  lnInvoiceCreate: ReturnType<typeof useLnInvoiceCreateMutation>["0"]
  lnUsdInvoiceCreate: ReturnType<typeof useLnUsdInvoiceCreateMutation>["0"]
  onChainAddressCurrent: ReturnType<typeof useOnChainAddressCurrentMutation>["0"]
}

export type GqlGeneratePaymentRequestResult = {
  gqlErrors: readonly GraphQLError[] | undefined
  applicationErrors: readonly GraphQlApplicationError[] | undefined
  paymentRequestData: PaymentRequestData | undefined
}

export type PaymentRequestData = LightningPaymentRequestData | OnChainPaymentRequestData

export type LightningPaymentRequestData = (LnInvoice | LnNoAmountInvoice) & {
  paymentRequestType: typeof PaymentRequest.Lightning
}

export type OnChainPaymentRequestData = {
  address: string
  amount?: BtcMoneyAmount | undefined
  memo?: string
  paymentRequestType: typeof PaymentRequest.OnChain
}
