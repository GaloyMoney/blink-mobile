import { WalletCurrency } from "@app/graphql/generated"
import { PaymentAmount } from "@app/types/amounts"
import {
  BaseCreatePaymentDetailsParams,
  ConvertPaymentAmount,
  GetFee,
  PaymentDetail,
  SendPayment,
  SetAmount,
  SetMemo,
  SetSendingWalletDescriptor,
  SetUnitOfAccount,
} from "./index.types"

export type CreateIntraledgerPaymentDetailsParams<T extends WalletCurrency> = {
  handle: string
  recipientWalletId: string
  unitOfAccountAmount?: PaymentAmount<WalletCurrency>
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
  const settlementAmount =
    unitOfAccountAmount &&
    sendingWalletDescriptor &&
    convertPaymentAmount(unitOfAccountAmount, sendingWalletDescriptor.currency)

  const getFee: GetFee<T> | undefined =
    sendingWalletDescriptor &&
    (async (_) => {
      return {
        amount: {
          amount: 0,
          currency: sendingWalletDescriptor.currency,
        },
      }
    })

  let sendPayment: SendPayment | undefined = undefined
  if (
    settlementAmount &&
    sendingWalletDescriptor &&
    sendingWalletDescriptor.currency === "BTC"
  ) {
    sendPayment = async (sendPaymentFns) => {
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
  } else if (
    sendingWalletDescriptor &&
    settlementAmount &&
    sendingWalletDescriptor.currency === "USD"
  ) {
    sendPayment = async (sendPaymentFns) => {
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
  }

  const setConvertPaymentAmount = (newConvertPaymentAmount: ConvertPaymentAmount) => {
    return CreateIntraledgerPaymentDetails({
      ...params,
      convertPaymentAmount: newConvertPaymentAmount,
    })
  }

  const setMemo: SetMemo<T> = (newMemo) => {
    return {
      ...CreateIntraledgerPaymentDetails({
        ...params,
        senderSpecifiedMemo: newMemo,
      }),
      getFee,
    }
  }

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
    destinationSpecifiedAmount: null,
    settlementAmount,
    settlementAmountIsEstimated: settlementAmount && false,
    unitOfAccountAmount,
    sendingWalletDescriptor,
    memo,
    paymentType: "intraledger",
    setSendingWalletDescriptor,
    setUnitOfAccount,
    convertPaymentAmount,
    setConvertPaymentAmount,
    setAmount,
    sendPayment,
    setMemo,
    getFee,
  } as const
}
