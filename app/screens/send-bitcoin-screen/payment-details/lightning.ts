import { WalletCurrency } from "@app/graphql/generated"
import { BtcPaymentAmount, PaymentAmount } from "@app/types/amounts"
import { PaymentType } from "@galoymoney/client/dist/parsing-v2"
import { LnUrlPayServiceResponse } from "lnurl-pay/dist/types/types"
import {
  ConvertPaymentAmount,
  SetInvoice,
  GetFee,
  PaymentDetail,
  SendPayment,
  SetAmount,
  SetSendingWalletDescriptor,
  SetUnitOfAccount,
  BaseCreatePaymentDetailsParams,
  PaymentDetailSetMemo,
  PaymentDetailSendPaymentGetFee,
} from "./index.types"

export type CreateNoAmountLightningPaymentDetailsParams<T extends WalletCurrency> = {
  paymentRequest: string
  unitOfAccountAmount: PaymentAmount<WalletCurrency>
} & BaseCreatePaymentDetailsParams<T>

export const createNoAmountLightningPaymentDetails = <T extends WalletCurrency>(
  params: CreateNoAmountLightningPaymentDetailsParams<T>,
): PaymentDetail<T> => {
  const {
    paymentRequest,
    convertPaymentAmount,
    unitOfAccountAmount,
    sendingWalletDescriptor,
    destinationSpecifiedMemo,
    senderSpecifiedMemo,
  } = params

  const memo = destinationSpecifiedMemo || senderSpecifiedMemo
  const settlementAmount = convertPaymentAmount(
    unitOfAccountAmount,
    sendingWalletDescriptor.currency,
  )

  const setConvertPaymentAmount = (convertPaymentAmount: ConvertPaymentAmount) => {
    return createNoAmountLightningPaymentDetails({
      ...params,
      convertPaymentAmount,
    })
  }

  let sendPaymentAndGetFee: PaymentDetailSendPaymentGetFee<T> = {
    canSendPayment: false,
    canGetFee: false,
  }

  if (
    settlementAmount?.amount &&
    sendingWalletDescriptor.currency === WalletCurrency.Btc
  ) {
    const getFee: GetFee<T> = async (getFeeFns) => {
      const { data } = await getFeeFns.lnNoAmountInvoiceFeeProbe({
        variables: {
          input: {
            amount: settlementAmount.amount,
            paymentRequest,
            walletId: sendingWalletDescriptor.id,
          },
        },
      })

      const rawAmount = data?.lnNoAmountInvoiceFeeProbe.amount
      const amount =
        typeof rawAmount === "number"
          ? {
              amount: rawAmount,
              currency: sendingWalletDescriptor.currency,
            }
          : rawAmount

      return {
        amount,
        errors: data?.lnNoAmountInvoiceFeeProbe.errors,
      }
    }

    const sendPayment: SendPayment = async (sendPaymentFns) => {
      const { data } = await sendPaymentFns.lnNoAmountInvoicePaymentSend({
        variables: {
          input: {
            walletId: sendingWalletDescriptor.id,
            paymentRequest,
            amount: settlementAmount.amount,
            memo,
          },
        },
      })

      return {
        status: data?.lnNoAmountInvoicePaymentSend.status,
        errors: data?.lnNoAmountInvoicePaymentSend.errors,
      }
    }

    sendPaymentAndGetFee = {
      canSendPayment: true,
      canGetFee: true,
      getFee,
      sendPayment,
    }
  } else if (
    settlementAmount?.amount &&
    sendingWalletDescriptor.currency === WalletCurrency.Usd
  ) {
    const getFee: GetFee<T> = async (getFeeFns) => {
      const { data } = await getFeeFns.lnNoAmountUsdInvoiceFeeProbe({
        variables: {
          input: {
            amount: settlementAmount.amount,
            paymentRequest,
            walletId: sendingWalletDescriptor.id,
          },
        },
      })

      const rawAmount = data?.lnNoAmountUsdInvoiceFeeProbe.amount
      const amount =
        typeof rawAmount === "number"
          ? {
              amount: rawAmount,
              currency: sendingWalletDescriptor.currency,
            }
          : rawAmount

      return {
        amount,
        errors: data?.lnNoAmountUsdInvoiceFeeProbe.errors,
      }
    }

    const sendPayment: SendPayment = async (sendPaymentFns) => {
      const { data } = await sendPaymentFns.lnNoAmountUsdInvoicePaymentSend({
        variables: {
          input: {
            walletId: sendingWalletDescriptor.id,
            paymentRequest,
            amount: settlementAmount.amount,
            memo,
          },
        },
      })

      return {
        status: data?.lnNoAmountUsdInvoicePaymentSend.status,
        errors: data?.lnNoAmountUsdInvoicePaymentSend.errors,
      }
    }

    sendPaymentAndGetFee = {
      canSendPayment: true,
      canGetFee: true,
      getFee,
      sendPayment,
    }
  }

  const setAmount: SetAmount<T> = (newUnitOfAccountAmount) => {
    return createNoAmountLightningPaymentDetails({
      ...params,
      unitOfAccountAmount: newUnitOfAccountAmount,
    })
  }

  const setMemo: PaymentDetailSetMemo<T> = destinationSpecifiedMemo
    ? { canSetMemo: false }
    : {
        setMemo: (newMemo) =>
          createNoAmountLightningPaymentDetails({
            ...params,
            senderSpecifiedMemo: newMemo,
          }),

        canSetMemo: true,
      }

  const setSendingWalletDescriptor: SetSendingWalletDescriptor<T> = (
    newSendingWalletDescriptor,
  ) => {
    return createNoAmountLightningPaymentDetails({
      ...params,
      sendingWalletDescriptor: newSendingWalletDescriptor,
    })
  }

  const setUnitOfAccount: SetUnitOfAccount<T> = (newUnitOfAccount) => {
    return createNoAmountLightningPaymentDetails({
      ...params,
      unitOfAccountAmount:
        unitOfAccountAmount &&
        convertPaymentAmount(unitOfAccountAmount, newUnitOfAccount),
    })
  }

  return {
    destination: paymentRequest,
    memo,
    convertPaymentAmount,
    setConvertPaymentAmount,
    paymentType: PaymentType.Lightning,
    settlementAmount,
    settlementAmountIsEstimated: false,
    unitOfAccountAmount,
    sendingWalletDescriptor,
    setAmount,
    canSetAmount: true,
    ...setMemo,
    ...sendPaymentAndGetFee,
    setSendingWalletDescriptor,
    setUnitOfAccount,
  } as const
}

export type CreateAmountLightningPaymentDetailsParams<T extends WalletCurrency> = {
  paymentRequest: string
  paymentRequestAmount: BtcPaymentAmount
  unitOfAccount: WalletCurrency
} & BaseCreatePaymentDetailsParams<T>

export const createAmountLightningPaymentDetails = <T extends WalletCurrency>(
  params: CreateAmountLightningPaymentDetailsParams<T>,
): PaymentDetail<T> => {
  const {
    paymentRequest,
    paymentRequestAmount,
    unitOfAccount,
    convertPaymentAmount,
    sendingWalletDescriptor,
    destinationSpecifiedMemo,
    senderSpecifiedMemo,
  } = params

  const memo = destinationSpecifiedMemo || senderSpecifiedMemo
  const unitOfAccountAmount = convertPaymentAmount(paymentRequestAmount, unitOfAccount)
  const settlementAmount = convertPaymentAmount(
    paymentRequestAmount,
    sendingWalletDescriptor.currency,
  )

  const sendPayment: SendPayment = async (sendPaymentFns) => {
    const { data } = await sendPaymentFns.lnInvoicePaymentSend({
      variables: {
        input: {
          walletId: sendingWalletDescriptor.id,
          paymentRequest,
          memo,
        },
      },
    })

    return {
      status: data?.lnInvoicePaymentSend.status,
      errors: data?.lnInvoicePaymentSend.errors,
    }
  }

  let getFee: GetFee<T>

  if (sendingWalletDescriptor.currency === WalletCurrency.Btc) {
    getFee = async (getFeeFns) => {
      const { data } = await getFeeFns.lnInvoiceFeeProbe({
        variables: {
          input: {
            paymentRequest,
            walletId: sendingWalletDescriptor.id,
          },
        },
      })

      const rawAmount = data?.lnInvoiceFeeProbe.amount
      const amount =
        typeof rawAmount === "number"
          ? {
              amount: rawAmount,
              currency: sendingWalletDescriptor.currency,
            }
          : rawAmount

      return {
        amount,
        errors: data?.lnInvoiceFeeProbe.errors,
      }
    }
  } else {
    getFee = async (getFeeFns) => {
      const { data } = await getFeeFns.lnUsdInvoiceFeeProbe({
        variables: {
          input: {
            paymentRequest,
            walletId: sendingWalletDescriptor.id,
          },
        },
      })

      const rawAmount = data?.lnUsdInvoiceFeeProbe.amount
      const amount =
        typeof rawAmount === "number"
          ? {
              amount: rawAmount,
              currency: sendingWalletDescriptor.currency,
            }
          : rawAmount

      return {
        amount,
        errors: data?.lnUsdInvoiceFeeProbe.errors,
      }
    }
  }

  const setMemo: PaymentDetailSetMemo<T> = destinationSpecifiedMemo
    ? {
        canSetMemo: false,
      }
    : {
        setMemo: (newMemo) =>
          createAmountLightningPaymentDetails({
            ...params,
            senderSpecifiedMemo: newMemo,
          }),

        canSetMemo: true,
      }

  const setConvertPaymentAmount = (newConvertPaymentAmount: ConvertPaymentAmount) => {
    return createAmountLightningPaymentDetails({
      ...params,
      convertPaymentAmount: newConvertPaymentAmount,
    })
  }

  const setSendingWalletDescriptor: SetSendingWalletDescriptor<T> = (
    newSendingWalletDescriptor,
  ) => {
    return createAmountLightningPaymentDetails({
      ...params,
      sendingWalletDescriptor: newSendingWalletDescriptor,
    })
  }

  const setUnitOfAccount: SetUnitOfAccount<T> = (_) => {
    return createAmountLightningPaymentDetails({
      ...params,
      unitOfAccount,
    })
  }

  return {
    destination: paymentRequest,
    destinationSpecifiedAmount: paymentRequestAmount,
    convertPaymentAmount,
    memo,
    paymentType: PaymentType.Lightning,
    settlementAmount,
    settlementAmountIsEstimated: sendingWalletDescriptor.currency !== WalletCurrency.Btc,
    sendingWalletDescriptor,
    unitOfAccountAmount,
    ...setMemo,
    canSetAmount: false,
    setSendingWalletDescriptor,
    setUnitOfAccount,
    setConvertPaymentAmount,
    sendPayment,
    canSendPayment: true,
    getFee,
    canGetFee: true,
  } as const
}

export type CreateLnurlPaymentDetailsParams<T extends WalletCurrency> = {
  lnurl: string
  lnurlParams: LnUrlPayServiceResponse
  paymentRequest?: string
  paymentRequestAmount?: BtcPaymentAmount
  unitOfAccountAmount: PaymentAmount<WalletCurrency>
} & BaseCreatePaymentDetailsParams<T>

export const createLnurlPaymentDetails = <T extends WalletCurrency>(
  params: CreateLnurlPaymentDetailsParams<T>,
): PaymentDetail<T> => {
  const {
    lnurl,
    lnurlParams,
    paymentRequest,
    paymentRequestAmount,
    unitOfAccountAmount,
    convertPaymentAmount,
    sendingWalletDescriptor,
    destinationSpecifiedMemo,
    senderSpecifiedMemo,
  } = params

  const memo = destinationSpecifiedMemo || senderSpecifiedMemo

  let settlementAmount: PaymentAmount<T>
  let sendPaymentAndGetFee: PaymentDetailSendPaymentGetFee<T> = {
    canGetFee: false,
    canSendPayment: false,
  }
  let destinationSpecifiedUnitOfAccountAmount: PaymentAmount<WalletCurrency> | undefined

  if (paymentRequest && paymentRequestAmount && unitOfAccountAmount) {
    const amountLightningPaymentDetails = createAmountLightningPaymentDetails({
      paymentRequest,
      paymentRequestAmount,
      convertPaymentAmount,
      unitOfAccount: unitOfAccountAmount?.currency,
      sendingWalletDescriptor,
      destinationSpecifiedMemo: memo,
      senderSpecifiedMemo: memo,
    })
    settlementAmount = amountLightningPaymentDetails.settlementAmount
    destinationSpecifiedUnitOfAccountAmount =
      amountLightningPaymentDetails.unitOfAccountAmount
    if (amountLightningPaymentDetails.canSendPayment) {
      sendPaymentAndGetFee = {
        canGetFee: true,
        canSendPayment: true,
        getFee: amountLightningPaymentDetails.getFee,
        sendPayment: amountLightningPaymentDetails.sendPayment,
      }
    }
  } else {
    settlementAmount = convertPaymentAmount(
      unitOfAccountAmount,
      sendingWalletDescriptor.currency,
    )
  }

  const setAmount = (newAmount: PaymentAmount<WalletCurrency>) => {
    return createLnurlPaymentDetails({
      ...params,
      paymentRequest: undefined,
      paymentRequestAmount: undefined,
      unitOfAccountAmount: newAmount,
    })
  }

  const setMemo: PaymentDetailSetMemo<T> = destinationSpecifiedMemo
    ? { canSetMemo: false }
    : {
        setMemo: (newMemo) =>
          createLnurlPaymentDetails({
            ...params,
            senderSpecifiedMemo: newMemo,
          }),
        canSetMemo: true,
      }

  const setConvertPaymentAmount = (newConvertPaymentAmount: ConvertPaymentAmount) => {
    return createLnurlPaymentDetails({
      ...params,
      convertPaymentAmount: newConvertPaymentAmount,
    })
  }

  const setInvoice: SetInvoice<T> = ({ paymentRequest, paymentRequestAmount }) => {
    return createLnurlPaymentDetails({
      ...params,
      paymentRequest,
      paymentRequestAmount,
    })
  }

  const setSendingWalletDescriptor: SetSendingWalletDescriptor<T> = (
    newSendingWalletDescriptor,
  ) => {
    return createLnurlPaymentDetails({
      ...params,
      sendingWalletDescriptor: newSendingWalletDescriptor,
    })
  }

  const setUnitOfAccount: SetUnitOfAccount<T> = (newUnitOfAccount) => {
    return createLnurlPaymentDetails({
      ...params,
      unitOfAccountAmount:
        unitOfAccountAmount &&
        convertPaymentAmount(unitOfAccountAmount, newUnitOfAccount),
    })
  }

  return {
    lnurlParams,
    destinationSpecifiedAmount: paymentRequestAmount,
    sendingWalletDescriptor,
    unitOfAccountAmount: destinationSpecifiedUnitOfAccountAmount || unitOfAccountAmount,
    paymentType: PaymentType.Lnurl,
    destination: lnurl,
    settlementAmount,
    memo,
    settlementAmountIsEstimated: sendingWalletDescriptor.currency !== WalletCurrency.Btc,
    setSendingWalletDescriptor,
    setUnitOfAccount,
    setInvoice,
    convertPaymentAmount,
    setConvertPaymentAmount,
    setAmount,
    canSetAmount: true,
    ...setMemo,
    ...sendPaymentAndGetFee,
  } as const
}
