import { WalletCurrency } from "@app/graphql/generated"
import { PaymentAmount } from "@app/types/amounts"
import { PaymentType } from "@galoymoney/client/dist/parsing-v2"
import {
  BaseCreatePaymentDetailsParams,
  ConvertPaymentAmount,
  GetFee,
  PaymentDetail,
  PaymentDetailSendPaymentGetFee,
  SetAmount,
  SetMemo,
  SetSendingWalletDescriptor,
  SetUnitOfAccount,
} from "./index.types"

export type CreateIntraledgerPaymentDetailsParams<T extends WalletCurrency> = {
  handle: string
  recipientWalletId: string
  unitOfAccountAmount: PaymentAmount<WalletCurrency>
} & BaseCreatePaymentDetailsParams<T>

export const CreateIntraledgerPaymentDetails = <T extends WalletCurrency>(
  params: CreateIntraledgerPaymentDetailsParams<T>,
): PaymentDetail<T> => {
  const {
    handle,
    recipientWalletId,
    unitOfAccountAmount,
    convertPaymentAmount,
    sendingWalletDescriptor,
    senderSpecifiedMemo,
  } = params

  const memo = senderSpecifiedMemo
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
    const sendPayment = async (sendPaymentFns) => {
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
    const sendPayment = async (sendPaymentFns) => {
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
    return CreateIntraledgerPaymentDetails({
      ...params,
      convertPaymentAmount: newConvertPaymentAmount,
    })
  }

  const setMemo: SetMemo<T> = (newMemo) =>
    CreateIntraledgerPaymentDetails({
      ...params,
      senderSpecifiedMemo: newMemo,
    })

  const setAmount: SetAmount<T> = (newUnitOfAccountAmount) => {
    return CreateIntraledgerPaymentDetails({
      ...params,
      unitOfAccountAmount: newUnitOfAccountAmount,
    })
  }

  const setSendingWalletDescriptor: SetSendingWalletDescriptor<T> = (
    newSendingWalletDescriptor,
  ) => {
    return CreateIntraledgerPaymentDetails({
      ...params,
      sendingWalletDescriptor: newSendingWalletDescriptor,
    })
  }

  const setUnitOfAccount: SetUnitOfAccount<T> = (newUnitOfAccount) => {
    return CreateIntraledgerPaymentDetails({
      ...params,
      unitOfAccountAmount:
        unitOfAccountAmount &&
        convertPaymentAmount(unitOfAccountAmount, newUnitOfAccount),
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
    setUnitOfAccount,
    convertPaymentAmount,
    setConvertPaymentAmount,
    setAmount,
    canSetAmount: true,
    setMemo,
    canSetMemo: true,
    ...sendPaymentAndGetFee,
  } as const
}
