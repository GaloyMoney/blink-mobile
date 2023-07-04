import {
  GraphQlApplicationError,
  LnInvoice,
  LnInvoiceCreateMutationHookResult,
  LnNoAmountInvoice,
  LnNoAmountInvoiceCreateMutationHookResult,
  LnUsdInvoiceCreateMutationHookResult,
  Network,
  OnChainAddressCurrentMutationHookResult,
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

export type ConvertMoneyAmount = <W extends WalletOrDisplayCurrency>(
  moneyAmount: MoneyAmount<WalletOrDisplayCurrency>,
  toCurrency: W,
) => MoneyAmount<W>

export type CreatePaymentRequestParams<T extends WalletCurrency> = {
  state: typeof PaymentRequestState
  paymentRequestData: PaymentRequestData
  receivingWalletDescriptor: WalletDescriptor<T>
  convertMoneyAmount: ConvertMoneyAmount
  unitOfAccountAmount?: MoneyAmount<WalletOrDisplayCurrency>
  network: Network
}

export const PaymentRequest = {
  Lightning: "Lightning",
  OnChain: "OnChain",
  PayCode: "PayCode",
} as const

export type PaymentRequestType = typeof PaymentRequest[keyof typeof PaymentRequest]

export type SetPaymentRequestData<T extends WalletCurrency> = (
  data: PaymentRequestData,
) => PaymentRequest<T>
export type SetReceivingWalletDescriptor<T extends WalletCurrency> = (
  receivingWalletDescriptor: WalletDescriptor<T>,
) => PaymentRequest<T>
export type SetMemo<T extends WalletCurrency> = (memo: string) => PaymentRequest<T>
export type SetAmount<T extends WalletCurrency> = (
  unitOfAccountAmount: MoneyAmount<WalletOrDisplayCurrency>,
) => PaymentRequest<T>
export type SetState<T extends WalletCurrency> = (
  state: typeof PaymentRequestState,
) => PaymentRequest<T>
export type SetConvertMoneyAmount<T extends WalletCurrency> = (
  convertMoneyAmount: ConvertMoneyAmount,
) => PaymentRequest<T>

export type GetFullUriFn = (params: {
  uppercase?: boolean
  prefix?: boolean
  username?: string
}) => string

export const PaymentRequestState = {
  Idle: "Idle",
  Loading: "Loading",
  Created: "Created",
  Error: "Error",
  Paid: "Paid",
  Expired: "Expired",
} as const

export type GeneratedPaymentRequest = {
  expiration?: Date
  getFullUri: GetFullUriFn
  paymentRequestDisplay: string // what is displayed to the user
  paymentRequestData?: PaymentRequestData
}

export type GeneratePaymentRequestFn<T extends WalletCurrency> = (
  mutations: GeneratePaymentRequestMutationParams,
) => Promise<PaymentRequest<T>>

type BasePaymentRequest<T extends WalletCurrency> = {
  state: typeof PaymentRequestState
  setState: SetState<T>

  paymentRequestData: PaymentRequestData
  setPaymentRequestData: SetPaymentRequestData<T>

  receivingWalletDescriptor: WalletDescriptor<T>
  setReceivingWalletDescriptor?: SetReceivingWalletDescriptor<T>
  canSetReceivingWalletDescriptor: boolean // false impies that the receiving wallet is the default wallet and can't be changed

  setMemo?: SetMemo<T>
  canSetMemo: boolean

  setAmount?: SetAmount<T>
  canSetAmount: boolean

  // Amount that gets set (undefined when flexible amount invoice)
  unitOfAccountAmount?: MoneyAmount<WalletOrDisplayCurrency> // amount in the currency that the user denominates the payment in
  settlementAmount?: WalletAmount<T> // amount in the currency of the receiving wallet

  convertMoneyAmount: ConvertMoneyAmount
  setConvertMoneyAmount: SetConvertMoneyAmount<T>

  generate: GeneratePaymentRequestFn<T>
  generatedRequest?: GeneratedPaymentRequest
  generatedErrors?: GeneratedPaymentRequestErrors
}

export type RequestStateCombo =
  | {
      state:
        | typeof PaymentRequestState.Created
        | typeof PaymentRequestState.Paid
        | typeof PaymentRequestState.Expired
      generatedRequest: GeneratedPaymentRequest
    }
  | {
      state:
        | typeof PaymentRequestState.Idle
        | typeof PaymentRequestState.Loading
        | typeof PaymentRequestState.Error
      generatedRequest?: undefined
    }

export type PaymentRequestSetMemo<T extends WalletCurrency> =
  | {
      paymentRequestType: typeof PaymentRequest.Lightning | typeof PaymentRequest.OnChain
      setMemo: SetMemo<T>
      canSetMemo: true
    }
  | {
      paymentRequestType: typeof PaymentRequest.PayCode
      setMemo: undefined
      canSetMemo: false
    }

export type PaymentRequestSetAmount<T extends WalletCurrency> =
  | {
      paymentRequestType: typeof PaymentRequest.Lightning | typeof PaymentRequest.OnChain
      setAmount: SetAmount<T>
      canSetAmount: true
    }
  | {
      paymentRequestType: typeof PaymentRequest.PayCode
      setAmount: undefined
      canSetAmount: false
    }

export type PaymentRequestSetReceivingWalletDescriptor<T extends WalletCurrency> =
  | {
      paymentRequestType: typeof PaymentRequest.Lightning
      setReceivingWalletDescriptor: SetReceivingWalletDescriptor<T>
      canSetReceivingWalletDescriptor: true
    }
  | {
      paymentRequestType: typeof PaymentRequest.PayCode | typeof PaymentRequest.OnChain
      setReceivingWalletDescriptor?: undefined
      canSetReceivingWalletDescriptor: false
    }

export type PaymentRequestAmountData<T extends WalletCurrency> =
  | {
      unitOfAccountAmount: MoneyAmount<WalletOrDisplayCurrency>
      settlementAmount: WalletAmount<T>
    }
  | {
      unitOfAccountAmount?: undefined
      settlementAmount?: undefined
    }

// TODO: Apply them
export type PaymentRequest<T extends WalletCurrency> = BasePaymentRequest<T>
// PaymentRequestAmountData<T> &
// PaymentRequestSetMemo<T> &
// PaymentRequestSetAmount<T> &
// PaymentRequestSetReceivingWalletDescriptor<T>
// RequestStateCombo

export type PaymentRequestData =
  | LightningPaymentRequestData
  | OnChainPaymentRequestData
  | PayCodePaymentRequestData

export type LightningPaymentRequestData = (LnInvoice | LnNoAmountInvoice) & {
  paymentRequestType: typeof PaymentRequest.Lightning
  memo?: string
}

export type OnChainPaymentRequestData = {
  paymentRequestType: typeof PaymentRequest.OnChain
  address: string
  amount?: BtcMoneyAmount | undefined
  memo?: string
}

export type PayCodePaymentRequestData = {
  paymentRequestType: typeof PaymentRequest.PayCode
  username: string
}

export type GeneratePaymentRequestMutationParams = {
  lnNoAmountInvoiceCreate: LnNoAmountInvoiceCreateMutationHookResult["0"]
  lnInvoiceCreate: LnInvoiceCreateMutationHookResult["0"]
  lnUsdInvoiceCreate: LnUsdInvoiceCreateMutationHookResult["0"]
  onChainAddressCurrent: OnChainAddressCurrentMutationHookResult["0"]
}

export type GeneratedPaymentRequestErrors = {
  gqlErrors?: readonly GraphQLError[]
  applicationErrors?: readonly GraphQlApplicationError[]
}
