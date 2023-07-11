import { WalletCurrency } from "@app/graphql/generated"
import { WalletDescriptor } from "@app/types/wallets"
import { MoneyAmount, WalletAmount, WalletOrDisplayCurrency } from "@app/types/amounts"

import {
  InvoiceType,
  PaymentRequest,
  InternalCreatePaymentRequestParams,
  ConvertMoneyAmountFn,
} from "./index.types"

export const createPaymentRequest = <T extends WalletCurrency>(
  params: InternalCreatePaymentRequestParams<T>,
): PaymentRequest<T> => {
  // These sets are always available
  const setType = (type: InvoiceType) => createPaymentRequest({ ...params, type })
  const setDefaultWalletDescriptor = (defaultWalletDescriptor: WalletDescriptor<T>) =>
    createPaymentRequest({ ...params, defaultWalletDescriptor })
  const setConvertMoneyAmount = (convertMoneyAmount: ConvertMoneyAmountFn) =>
    createPaymentRequest({ ...params, convertMoneyAmount })

  const { type, defaultWalletDescriptor, convertMoneyAmount, memo } = params

  // Permissions for the specified type
  const permissions = {
    canSetReceivingWalletDescriptor: false,
    canSetMemo: false,
    canSetAmount: false,
  }
  switch (type) {
    case "Lightning":
      permissions.canSetReceivingWalletDescriptor = true
    case "OnChain":
      permissions.canSetMemo = true
      permissions.canSetAmount = true
  }

  // Permission based sets
  let setReceivingWalletDescriptor:
    | ((receivingWalletDescriptor: WalletDescriptor<T>) => PaymentRequest<T>)
    | undefined = undefined
  if (permissions.canSetReceivingWalletDescriptor) {
    setReceivingWalletDescriptor = (receivingWalletDescriptor) =>
      createPaymentRequest({ ...params, receivingWalletDescriptor })
  }
  let setMemo: ((memo: string) => PaymentRequest<T>) | undefined = undefined
  if (permissions.canSetMemo) {
    setMemo = (memo) => createPaymentRequest({ ...params, memo })
  }
  let setAmount:
    | ((unitOfAccountAmount: MoneyAmount<WalletOrDisplayCurrency>) => PaymentRequest<T>)
    | undefined = undefined
  if (permissions.canSetAmount) {
    setAmount = (unitOfAccountAmount) =>
      createPaymentRequest({ ...params, unitOfAccountAmount })
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

  // Set settlement amount if unit of account amount is set
  let { unitOfAccountAmount } = params
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
