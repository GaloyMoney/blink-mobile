import { WalletCurrency } from "@app/graphql/generated"
import { BtcPaymentAmount, PaymentAmount } from "@app/types/amounts"
import { PaymentType } from "@galoymoney/client/dist/parsing-v2"
import {
  ConvertPaymentAmount,
  PaymentDetail,
  SetAmount,
  SetSendingWalletDescriptor,
  BaseCreatePaymentDetailsParams,
  PaymentDetailSendPaymentGetFee,
  PaymentDetailSetMemo,
  SendPayment,
  GetFee,
} from "./index.types"

export type CreateNoAmountOnchainPaymentDetailsParams<T extends WalletCurrency> = {
  address: string
  unitOfAccountAmount: PaymentAmount<WalletCurrency>
} & BaseCreatePaymentDetailsParams<T>

export const createNoAmountOnchainPaymentDetails = <T extends WalletCurrency>(
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

  const settlementAmount = convertPaymentAmount(
    unitOfAccountAmount,
    sendingWalletDescriptor.currency,
  )
  const memo = destinationSpecifiedMemo || senderSpecifiedMemo

  if (sendingWalletDescriptor.currency !== WalletCurrency.Btc) {
    throw new Error("Onchain payments are only supported for BTC wallets")
  }

  let sendPaymentAndGetFee: PaymentDetailSendPaymentGetFee<T> = {
    canSendPayment: false,
    canGetFee: false,
  }

  if (
    settlementAmount.amount &&
    sendingWalletDescriptor.currency === WalletCurrency.Btc
  ) {
    const sendPayment: SendPayment = async (sendPaymentFns) => {
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

    const getFee: GetFee<T> = async (getFeeFns) => {
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

    sendPaymentAndGetFee = {
      canSendPayment: true,
      canGetFee: true,
      sendPayment,
      getFee,
    }
  }

  const setAmount: SetAmount<T> | undefined = (newUnitOfAccountAmount) => {
    return createNoAmountOnchainPaymentDetails({
      ...params,
      unitOfAccountAmount: newUnitOfAccountAmount,
    })
  }

  const setMemo: PaymentDetailSetMemo<T> = destinationSpecifiedMemo
    ? { canSetMemo: false }
    : {
        setMemo: (newMemo) =>
          createNoAmountOnchainPaymentDetails({
            ...params,
            senderSpecifiedMemo: newMemo,
          }),
        canSetMemo: true,
      }

  const setConvertPaymentAmount = (newConvertPaymentAmount: ConvertPaymentAmount) => {
    return createNoAmountOnchainPaymentDetails({
      ...params,
      convertPaymentAmount: newConvertPaymentAmount,
    })
  }

  const setSendingWalletDescriptor: SetSendingWalletDescriptor<T> = (
    newSendingWalletDescriptor,
  ) => {
    return createNoAmountOnchainPaymentDetails({
      ...params,
      sendingWalletDescriptor: newSendingWalletDescriptor,
    })
  }

  return {
    destination: address,
    settlementAmount,
    settlementAmountIsEstimated: sendingWalletDescriptor.currency !== WalletCurrency.Btc,
    unitOfAccountAmount,
    sendingWalletDescriptor,
    memo,
    paymentType: PaymentType.Onchain,
    setSendingWalletDescriptor,
    convertPaymentAmount,
    setConvertPaymentAmount,
    ...setMemo,
    setAmount,
    canSetAmount: true,
    ...sendPaymentAndGetFee,
  } as const
}

export type CreateAmountOnchainPaymentDetailsParams<T extends WalletCurrency> = {
  address: string
  destinationSpecifiedAmount: BtcPaymentAmount
} & BaseCreatePaymentDetailsParams<T>

export const createAmountOnchainPaymentDetails = <T extends WalletCurrency>(
  params: CreateAmountOnchainPaymentDetailsParams<T>,
): PaymentDetail<T> => {
  const {
    destinationSpecifiedAmount,
    convertPaymentAmount,
    sendingWalletDescriptor,
    destinationSpecifiedMemo,
    senderSpecifiedMemo,
    address,
  } = params

  if (sendingWalletDescriptor.currency !== WalletCurrency.Btc) {
    throw new Error("Onchain payments are only supported for BTC wallets")
  }

  const settlementAmount = convertPaymentAmount(
    destinationSpecifiedAmount,
    sendingWalletDescriptor.currency,
  )
  const unitOfAccountAmount = destinationSpecifiedAmount

  const memo = destinationSpecifiedMemo || senderSpecifiedMemo

  let sendPaymentAndGetFee: PaymentDetailSendPaymentGetFee<T> = {
    canSendPayment: false,
    canGetFee: false,
  }

  if (sendingWalletDescriptor.currency === WalletCurrency.Btc) {
    const sendPayment: SendPayment = async (sendPaymentFns) => {
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

    const getFee: GetFee<T> = async (getFeeFns) => {
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

    sendPaymentAndGetFee = {
      canSendPayment: true,
      canGetFee: true,
      sendPayment,
      getFee,
    }
  }

  const setMemo: PaymentDetailSetMemo<T> = destinationSpecifiedMemo
    ? {
        canSetMemo: false,
      }
    : {
        setMemo: (newMemo) =>
          createAmountOnchainPaymentDetails({
            ...params,
            senderSpecifiedMemo: newMemo,
          }),
        canSetMemo: true,
      }

  const setConvertPaymentAmount = (newConvertPaymentAmount: ConvertPaymentAmount) => {
    return createAmountOnchainPaymentDetails({
      ...params,
      convertPaymentAmount: newConvertPaymentAmount,
    })
  }

  const setSendingWalletDescriptor: SetSendingWalletDescriptor<T> = (
    newSendingWalletDescriptor,
  ) => {
    return createAmountOnchainPaymentDetails({
      ...params,
      sendingWalletDescriptor: newSendingWalletDescriptor,
    })
  }

  return {
    destination: address,
    destinationSpecifiedAmount,
    settlementAmount,
    settlementAmountIsEstimated: sendingWalletDescriptor.currency !== WalletCurrency.Btc,
    unitOfAccountAmount,
    sendingWalletDescriptor,
    setSendingWalletDescriptor,
    canSetAmount: false,
    convertPaymentAmount,
    setConvertPaymentAmount,
    ...setMemo,
    memo,
    paymentType: PaymentType.Onchain,
    ...sendPaymentAndGetFee,
  } as const
}
