import { WalletCurrency } from "@app/graphql/generated"
import { BtcPaymentAmount, PaymentAmount } from "@app/types/amounts"
import {
  ConvertPaymentAmount,
  GetFee,
  PaymentDetail,
  SendPayment,
  SetAmount,
  SetMemo,
  SetSendingWalletDescriptor,
  SetUnitOfAccount,
  BaseCreatePaymentDetailsParams,
} from "./index.types"

export type CreateNoAmountOnchainPaymentDetailsParams<T extends WalletCurrency> = {
  address: string
  unitOfAccountAmount?: PaymentAmount<WalletCurrency>
} & BaseCreatePaymentDetailsParams<T>

export const CreateNoAmountOnchainPaymentDetails = <T extends WalletCurrency>(
  params: CreateNoAmountOnchainPaymentDetailsParams<T>,
): PaymentDetail<T> => {
  const {
    convertPaymentAmount,
    sendingWalletDescriptor,
    destinationSpecifiedMemo,
    unitOfAccountAmount,
    senderSpecifiedMemo,
    address,
  } = params

  const settlementAmount =
    unitOfAccountAmount &&
    sendingWalletDescriptor &&
    convertPaymentAmount(unitOfAccountAmount, sendingWalletDescriptor.currency)
  const memo = destinationSpecifiedMemo || senderSpecifiedMemo

  if (sendingWalletDescriptor && sendingWalletDescriptor.currency !== "BTC") {
    throw new Error("Onchain payments are only supported for BTC wallets")
  }

  let sendPayment: SendPayment | undefined = undefined
  let getFee: GetFee<T> | undefined = undefined

  if (
    sendingWalletDescriptor &&
    settlementAmount?.amount &&
    sendingWalletDescriptor.currency === "BTC"
  ) {
    sendPayment = async (sendPaymentFns) => {
      const { data } = await sendPaymentFns.onChainPaymentSend({
        variables: {
          input: {
            walletId: sendingWalletDescriptor.id,
            address,
            amount: settlementAmount.amount,
          },
        },
      })

      return {
        status: data?.onChainPaymentSend.status,
        errors: data?.onChainPaymentSend.errors,
      }
    }

    getFee = async (getFeeFns) => {
      const { data } = await getFeeFns.onChainTxFee({
        variables: {
          walletId: sendingWalletDescriptor.id,
          address,
          amount: settlementAmount.amount,
        },
      })

      const rawAmount = data?.onChainTxFee.amount
      const amount =
        typeof rawAmount === "number"
          ? {
              amount: rawAmount,
              currency: sendingWalletDescriptor.currency,
            }
          : rawAmount

      return {
        amount,
      }
    }
  }

  const setAmount: SetAmount<T> | null = (newUnitOfAccountAmount) => {
    return CreateNoAmountOnchainPaymentDetails({
      ...params,
      unitOfAccountAmount: newUnitOfAccountAmount,
    })
  }

  const setMemo: SetMemo<T> | null = destinationSpecifiedMemo
    ? null
    : (newMemo) => {
        return {
          ...CreateNoAmountOnchainPaymentDetails({
            ...params,
            senderSpecifiedMemo: newMemo,
          }),
          getFee,
        }
      }

  const setConvertPaymentAmount = (newConvertPaymentAmount: ConvertPaymentAmount) => {
    return CreateNoAmountOnchainPaymentDetails({
      ...params,
      convertPaymentAmount: newConvertPaymentAmount,
    })
  }

  const setSendingWalletDescriptor: SetSendingWalletDescriptor<T> = (
    newSendingWalletDescriptor,
  ) => {
    return CreateNoAmountOnchainPaymentDetails({
      ...params,
      sendingWalletDescriptor: newSendingWalletDescriptor,
    })
  }

  const setUnitOfAccount: SetUnitOfAccount<T> = (newUnitOfAccount) => {
    return CreateNoAmountOnchainPaymentDetails({
      ...params,
      unitOfAccountAmount:
        unitOfAccountAmount &&
        convertPaymentAmount(unitOfAccountAmount, newUnitOfAccount),
    })
  }

  return {
    destination: address,
    destinationSpecifiedAmount: null,
    settlementAmount,
    settlementAmountIsEstimated:
      sendingWalletDescriptor && sendingWalletDescriptor.currency !== "BTC",
    unitOfAccountAmount,
    sendingWalletDescriptor,
    memo,
    paymentType: "onchain",
    setSendingWalletDescriptor,
    setUnitOfAccount,
    convertPaymentAmount,
    setConvertPaymentAmount,
    setMemo,
    setAmount,
    sendPayment,
    getFee,
  }
}

export type CreateAmountOnchainPaymentDetailsParams<T extends WalletCurrency> = {
  address: string
  destinationSpecifiedAmount: BtcPaymentAmount
  unitOfAccount: WalletCurrency
} & BaseCreatePaymentDetailsParams<T>

export const CreateAmountOnchainPaymentDetails = <T extends WalletCurrency>(
  params: CreateAmountOnchainPaymentDetailsParams<T>,
): PaymentDetail<T> => {
  const {
    unitOfAccount,
    destinationSpecifiedAmount,
    convertPaymentAmount,
    sendingWalletDescriptor,
    destinationSpecifiedMemo,
    senderSpecifiedMemo,
    address,
  } = params

  if (sendingWalletDescriptor && sendingWalletDescriptor.currency !== "BTC") {
    throw new Error("Onchain payments are only supported for BTC wallets")
  }

  const settlementAmount =
    sendingWalletDescriptor &&
    convertPaymentAmount(destinationSpecifiedAmount, sendingWalletDescriptor.currency)
  const unitOfAccountAmount = convertPaymentAmount(
    destinationSpecifiedAmount,
    unitOfAccount,
  )
  const memo = destinationSpecifiedMemo || senderSpecifiedMemo

  let sendPayment: SendPayment | undefined = undefined
  let getFee: GetFee<T> | undefined = undefined

  if (
    sendingWalletDescriptor &&
    settlementAmount &&
    sendingWalletDescriptor.currency === "BTC"
  ) {
    sendPayment = async (sendPaymentFns) => {
      const { data } = await sendPaymentFns.onChainPaymentSend({
        variables: {
          input: {
            walletId: sendingWalletDescriptor.id,
            address,
            amount: settlementAmount.amount,
          },
        },
      })

      return {
        status: data?.onChainPaymentSend.status,
        errors: data?.onChainPaymentSend.errors,
      }
    }

    getFee = async (getFeeFns) => {
      const { data } = await getFeeFns.onChainTxFee({
        variables: {
          walletId: sendingWalletDescriptor.id,
          address,
          amount: settlementAmount.amount,
        },
      })

      const rawAmount = data?.onChainTxFee.amount
      const amount =
        typeof rawAmount === "number"
          ? {
              amount: rawAmount,
              currency: sendingWalletDescriptor.currency,
            }
          : rawAmount

      return {
        amount,
      }
    }
  }

  const setMemo: SetMemo<T> | null = destinationSpecifiedMemo
    ? null
    : (newMemo) => {
        return {
          ...CreateAmountOnchainPaymentDetails({
            ...params,
            senderSpecifiedMemo: newMemo,
          }),
          getFee,
        }
      }

  const setConvertPaymentAmount = (newConvertPaymentAmount: ConvertPaymentAmount) => {
    return CreateAmountOnchainPaymentDetails({
      ...params,
      convertPaymentAmount: newConvertPaymentAmount,
    })
  }

  const setSendingWalletDescriptor: SetSendingWalletDescriptor<T> = (
    newSendingWalletDescriptor,
  ) => {
    return CreateAmountOnchainPaymentDetails({
      ...params,
      sendingWalletDescriptor: newSendingWalletDescriptor,
    })
  }

  const setUnitOfAccount: SetUnitOfAccount<T> = (newUnitOfAccount) => {
    return CreateAmountOnchainPaymentDetails({
      ...params,
      unitOfAccount: newUnitOfAccount,
    })
  }

  return {
    destination: address,
    destinationSpecifiedAmount,
    settlementAmount,
    settlementAmountIsEstimated:
      sendingWalletDescriptor && sendingWalletDescriptor.currency !== "BTC",
    unitOfAccountAmount,
    sendingWalletDescriptor,
    setAmount: null,
    setSendingWalletDescriptor,
    setUnitOfAccount,
    convertPaymentAmount,
    setConvertPaymentAmount,
    setMemo,
    memo,
    paymentType: "onchain",
    sendPayment,
    getFee,
  }
}
