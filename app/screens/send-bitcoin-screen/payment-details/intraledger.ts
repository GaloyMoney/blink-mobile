import { WalletCurrency } from "@app/graphql/generated"
import { PaymentAmount } from "@app/types/amounts"
import { PaymentType } from "@galoymoney/client/dist/parsing-v2"
import {
  BaseCreatePaymentDetailsParams,
  ConvertPaymentAmount,
  GetFee,
  PaymentDetail,
  PaymentDetailSendPaymentGetFee,
  PaymentDetailSetMemo,
  SendPayment,
  SetAmount,
  SetSendingWalletDescriptor,
} from "./index.types"

export type CreateIntraledgerPaymentDetailsParams<T extends WalletCurrency> = {
  handle: string
  recipientWalletId: string
  unitOfAccountAmount: PaymentAmount<WalletCurrency>
} & BaseCreatePaymentDetailsParams<T>

export const createIntraledgerPaymentDetails = <T extends WalletCurrency>(
  params: CreateIntraledgerPaymentDetailsParams<T>,
): PaymentDetail<T> => {
  const {
    handle,
    recipientWalletId,
    unitOfAccountAmount,
    convertPaymentAmount,
    sendingWalletDescriptor,
    senderSpecifiedMemo,
    destinationSpecifiedMemo,
  } = params

  const memo = destinationSpecifiedMemo || senderSpecifiedMemo
  const settlementAmount = convertPaymentAmount(
    unitOfAccountAmount,
    sendingWalletDescriptor.currency,
  )

  const getFee: GetFee<T> = (_) => {
    return Promise.resolve({
      amount: {
        amount: 0,
        currency: sendingWalletDescriptor.currency,
      },
    })
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
      const { data } = await sendPaymentFns.intraLedgerPaymentSend({
        variables: {
          input: {
            walletId: sendingWalletDescriptor.id,
            recipientWalletId,
            amount: settlementAmount.amount,
            memo,
          },
        },
      })

      return {
        status: data?.intraLedgerPaymentSend.status,
        errors: data?.intraLedgerPaymentSend.errors,
      }
    }

    sendPaymentAndGetFee = {
      canSendPayment: true,
      sendPayment,
      canGetFee: true,
      getFee,
    }
  } else if (
    settlementAmount.amount &&
    sendingWalletDescriptor.currency === WalletCurrency.Usd
  ) {
    const sendPayment: SendPayment = async (sendPaymentFns) => {
      const { data } = await sendPaymentFns.intraLedgerUsdPaymentSend({
        variables: {
          input: {
            walletId: sendingWalletDescriptor.id,
            recipientWalletId,
            amount: settlementAmount.amount,
            memo,
          },
        },
      })

      return {
        status: data?.intraLedgerUsdPaymentSend.status,
        errors: data?.intraLedgerUsdPaymentSend.errors,
      }
    }

    sendPaymentAndGetFee = {
      canSendPayment: true,
      sendPayment,
      canGetFee: true,
      getFee,
    }
  }

  const setConvertPaymentAmount = (newConvertPaymentAmount: ConvertPaymentAmount) => {
    return createIntraledgerPaymentDetails({
      ...params,
      convertPaymentAmount: newConvertPaymentAmount,
    })
  }

  const setMemo: PaymentDetailSetMemo<T> = destinationSpecifiedMemo
    ? { canSetMemo: false }
    : {
        setMemo: (newMemo) =>
          createIntraledgerPaymentDetails({
            ...params,
            senderSpecifiedMemo: newMemo,
          }),
        canSetMemo: true,
      }

  const setAmount: SetAmount<T> = (newUnitOfAccountAmount) => {
    return createIntraledgerPaymentDetails({
      ...params,
      unitOfAccountAmount: newUnitOfAccountAmount,
    })
  }

  const setSendingWalletDescriptor: SetSendingWalletDescriptor<T> = (
    newSendingWalletDescriptor,
  ) => {
    return createIntraledgerPaymentDetails({
      ...params,
      sendingWalletDescriptor: newSendingWalletDescriptor,
    })
  }

  return {
    destination: handle,
    settlementAmount,
    settlementAmountIsEstimated: false,
    unitOfAccountAmount,
    sendingWalletDescriptor,
    memo,
    paymentType: PaymentType.Intraledger,
    setSendingWalletDescriptor,
    convertPaymentAmount,
    setConvertPaymentAmount,
    setAmount,
    canSetAmount: true,
    ...setMemo,
    ...sendPaymentAndGetFee,
  } as const
}
