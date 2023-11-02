import { WalletCurrency } from "@app/graphql/generated"
import { BtcWalletDescriptor, WalletDescriptor } from "@app/types/wallets"
import { MoneyAmount, WalletAmount, WalletOrDisplayCurrency } from "@app/types/amounts"

import {
  InvoiceType,
  PaymentRequestCreationData,
  BaseCreatePaymentRequestCreationDataParams,
  ConvertMoneyAmountFn,
  Invoice,
} from "./index.types"

export const createPaymentRequestCreationData = <T extends WalletCurrency>(
  params: BaseCreatePaymentRequestCreationDataParams<T>,
): PaymentRequestCreationData<T> => {
  // These sets are always available
  const setType = (type: InvoiceType) =>
    createPaymentRequestCreationData({ ...params, type })
  const setDefaultWalletDescriptor = (defaultWalletDescriptor: WalletDescriptor<T>) =>
    createPaymentRequestCreationData({ ...params, defaultWalletDescriptor })
  const setBitcoinWalletDescriptor = (bitcoinWalletDescriptor: BtcWalletDescriptor) =>
    createPaymentRequestCreationData({ ...params, bitcoinWalletDescriptor })
  const setConvertMoneyAmount = (convertMoneyAmount: ConvertMoneyAmountFn) =>
    createPaymentRequestCreationData({ ...params, convertMoneyAmount })
  const setUsername = (username: string) =>
    createPaymentRequestCreationData({ ...params, username })

  const {
    type,
    defaultWalletDescriptor,
    bitcoinWalletDescriptor,
    convertMoneyAmount,
    memo,
  } = params

  // Permissions for the specified type
  const permissions = {
    canSetReceivingWalletDescriptor: false,
    canSetMemo: false,
    canSetAmount: true,
  }
  if (type === Invoice.Lightning || type === Invoice.OnChain) {
    permissions.canSetReceivingWalletDescriptor = true
    permissions.canSetMemo = true
  }

  // Permission based sets
  let setReceivingWalletDescriptor:
    | ((receivingWalletDescriptor: WalletDescriptor<T>) => PaymentRequestCreationData<T>)
    | undefined = undefined
  if (permissions.canSetReceivingWalletDescriptor) {
    setReceivingWalletDescriptor = (receivingWalletDescriptor) =>
      createPaymentRequestCreationData({ ...params, receivingWalletDescriptor })
  }
  let setMemo: ((memo: string) => PaymentRequestCreationData<T>) | undefined = undefined
  if (permissions.canSetMemo) {
    setMemo = (memo) => createPaymentRequestCreationData({ ...params, memo })
  }
  let setAmount:
    | ((
        unitOfAccountAmount: MoneyAmount<WalletOrDisplayCurrency>,
      ) => PaymentRequestCreationData<T>)
    | undefined = undefined
  if (permissions.canSetAmount) {
    setAmount = (unitOfAccountAmount) =>
      createPaymentRequestCreationData({ ...params, unitOfAccountAmount })
  }

  // Set default receiving wallet descriptor
  let { receivingWalletDescriptor } = params
  if (!receivingWalletDescriptor) {
    receivingWalletDescriptor = defaultWalletDescriptor
  }

  // Paycode only to Bitcoin
  if (type === "PayCode") {
    receivingWalletDescriptor = bitcoinWalletDescriptor as WalletDescriptor<T>
  }

  // Set settlement amount if unit of account amount is set
  const { unitOfAccountAmount } = params
  let settlementAmount: WalletAmount<T> | undefined = undefined
  if (unitOfAccountAmount) {
    settlementAmount = convertMoneyAmount(
      unitOfAccountAmount,
      receivingWalletDescriptor.currency,
    )
  }

  return {
    ...params,
    ...permissions,
    setType,
    setBitcoinWalletDescriptor,
    setDefaultWalletDescriptor,
    setConvertMoneyAmount,
    setUsername,
    receivingWalletDescriptor,

    // optional sets
    setReceivingWalletDescriptor,
    setMemo,
    setAmount,

    // optional data
    unitOfAccountAmount,
    settlementAmount,
    memo,

    canUsePaycode: Boolean(params.username),
  }
}
