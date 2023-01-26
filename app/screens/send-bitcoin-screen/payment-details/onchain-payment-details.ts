import { WalletCurrency } from "@app/graphql/generated"
import { BtcPaymentAmount, PaymentAmount } from "@app/types/amounts"
import {
  ConvertPaymentAmount,
  PaymentDetail,
  SetAmount,
  SetSendingWalletDescriptor,
  SetUnitOfAccount,
  BaseCreatePaymentDetailsParams,
  PaymentDetailSendPaymentGetFee,
  PaymentDetailSetMemo,
} from "./index.types"

export type CreateNoAmountOnchainPaymentDetailsParams<T extends WalletCurrency> = {
  address: string
  unitOfAccountAmount: PaymentAmount<WalletCurrency>
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
    const sendPayment = async (sendPaymentFns) => {
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

    const getFee = async (getFeeFns) => {
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
    return CreateNoAmountOnchainPaymentDetails({
      ...params,
      unitOfAccountAmount: newUnitOfAccountAmount,
    })
  }

  const setMemo: PaymentDetailSetMemo<T> = destinationSpecifiedMemo
    ? { canSetMemo: false }
    : {
        setMemo: (newMemo) =>
          CreateNoAmountOnchainPaymentDetails({
            ...params,
            senderSpecifiedMemo: newMemo,
          }),
        canSetMemo: true,
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
    settlementAmount,
    settlementAmountIsEstimated: sendingWalletDescriptor.currency !== WalletCurrency.Btc,
    unitOfAccountAmount,
    sendingWalletDescriptor,
    memo,
    paymentType: "onchain",
    setSendingWalletDescriptor,
    setUnitOfAccount,
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

  if (sendingWalletDescriptor.currency !== WalletCurrency.Btc) {
    throw new Error("Onchain payments are only supported for BTC wallets")
  }

  const settlementAmount = convertPaymentAmount(
    destinationSpecifiedAmount,
    sendingWalletDescriptor.currency,
  )
  const unitOfAccountAmount = convertPaymentAmount(
    destinationSpecifiedAmount,
    unitOfAccount,
  )
  const memo = destinationSpecifiedMemo || senderSpecifiedMemo

  let sendPaymentAndGetFee: PaymentDetailSendPaymentGetFee<T> = {
    canSendPayment: false,
    canGetFee: false,
  }

  if (sendingWalletDescriptor.currency === WalletCurrency.Btc) {
    const sendPayment = async (sendPaymentFns) => {
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

    const getFee = async (getFeeFns) => {
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
          CreateAmountOnchainPaymentDetails({
            ...params,
            senderSpecifiedMemo: newMemo,
          }),
        canSetMemo: true,
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
    settlementAmountIsEstimated: sendingWalletDescriptor.currency !== WalletCurrency.Btc,
    unitOfAccountAmount,
    sendingWalletDescriptor,
    setSendingWalletDescriptor,
    setUnitOfAccount,
    canSetAmount: false,
    convertPaymentAmount,
    setConvertPaymentAmount,
    ...setMemo,
    memo,
    paymentType: "onchain",
    ...sendPaymentAndGetFee,
  } as const
}
