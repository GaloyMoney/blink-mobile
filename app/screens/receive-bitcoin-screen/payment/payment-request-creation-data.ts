import { WalletCurrency } from "@app/graphql/generated"
import { WalletDescriptor } from "@app/types/wallets"
import { MoneyAmount, WalletAmount, WalletOrDisplayCurrency } from "@app/types/amounts"

import {
  InvoiceType,
  PaymentRequestCreationData,
  BaseCreatePaymentRequestCreationDataParams,
  ConvertMoneyAmountFn,
} from "./index.types"

export const createPaymentRequestCreationData = <T extends WalletCurrency>(
  params: BaseCreatePaymentRequestCreationDataParams<T>,
): PaymentRequestCreationData<T> => {
  // These sets are always available
  const setType = (type: InvoiceType) =>
    createPaymentRequestCreationData({ ...params, type })
  const setDefaultWalletDescriptor = (defaultWalletDescriptor: WalletDescriptor<T>) =>
    createPaymentRequestCreationData({ ...params, defaultWalletDescriptor })
  const setConvertMoneyAmount = (convertMoneyAmount: ConvertMoneyAmountFn) =>
    createPaymentRequestCreationData({ ...params, convertMoneyAmount })
  const setUsername = (username: string) =>
    createPaymentRequestCreationData({ ...params, username })

  const { type, defaultWalletDescriptor, convertMoneyAmount, memo } = params

  // Permissions for the specified type
  const permissions = {
    canSetReceivingWalletDescriptor: false,
    canSetMemo: false,
    canSetAmount: false,
  }
  /* eslint-disable no-fallthrough */
  switch (type) {
    case "Lightning":
      permissions.canSetReceivingWalletDescriptor = true
    case "OnChain":
      permissions.canSetMemo = true
      permissions.canSetAmount = true
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

  // OnChain only on BTC
  if (type === "OnChain") {
    receivingWalletDescriptor = params.bitcoinWalletDescriptor as WalletDescriptor<T>
  }

  // Paycode only in Default
  if (type === "PayCode") {
    receivingWalletDescriptor = params.defaultWalletDescriptor
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
