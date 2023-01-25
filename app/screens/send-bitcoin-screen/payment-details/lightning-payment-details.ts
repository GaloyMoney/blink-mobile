import { WalletCurrency } from "@app/graphql/generated"
import { BtcPaymentAmount, PaymentAmount } from "@app/types/amounts"
import { LnUrlPayServiceResponse } from "lnurl-pay/dist/types/types"
import {
  ConvertPaymentAmount,
  SetInvoice,
  GetFee,
  PaymentDetail,
  SendPayment,
  SetAmount,
  SetMemo,
  SetSendingWalletDescriptor,
  SetUnitOfAccount,
  BaseCreatePaymentDetailsParams,
} from "./index.types"

export type CreateNoAmountLightningPaymentDetailsParams<T extends WalletCurrency> = {
  paymentRequest: string
  unitOfAccountAmount?: PaymentAmount<WalletCurrency>
} & BaseCreatePaymentDetailsParams<T>

export const CreateNoAmountLightningPaymentDetails = <T extends WalletCurrency>(
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
  const settlementAmount =
    unitOfAccountAmount &&
    convertPaymentAmount(unitOfAccountAmount, sendingWalletDescriptor.currency)

  let getFee: GetFee<T> | undefined = undefined
  let sendPayment: SendPayment | undefined = undefined

  const setConvertPaymentAmount = (convertPaymentAmount: ConvertPaymentAmount) => {
    return CreateNoAmountLightningPaymentDetails({
      ...params,
      convertPaymentAmount,
    })
  }

  if (
    settlementAmount?.amount &&
    sendingWalletDescriptor.currency === "BTC"
  ) {
    getFee = async (getFeeFns) => {
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

    sendPayment = async (sendPaymentFns) => {
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
  } else if (
    settlementAmount?.amount &&
    sendingWalletDescriptor.currency === "USD"
  ) {
    getFee = async (getFeeFns) => {
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

    sendPayment = async (sendPaymentFns) => {
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
  }

  const setAmount: SetAmount<T> = (newUnitOfAccountAmount) => {
    return CreateNoAmountLightningPaymentDetails({
      ...params,
      unitOfAccountAmount: newUnitOfAccountAmount,
    })
  }

  const setMemo: SetMemo<T> | undefined = destinationSpecifiedMemo
    ? undefined
    : (newMemo) => {
        return {
          ...CreateNoAmountLightningPaymentDetails({
            ...params,
            senderSpecifiedMemo: newMemo,
          }),
          getFee,
        }
      }

  const setSendingWalletDescriptor: SetSendingWalletDescriptor<T> = (
    newSendingWalletDescriptor,
  ) => {
    return CreateNoAmountLightningPaymentDetails({
      ...params,
      sendingWalletDescriptor: newSendingWalletDescriptor,
    })
  }

  const setUnitOfAccount: SetUnitOfAccount<T> = (newUnitOfAccount) => {
    return CreateNoAmountLightningPaymentDetails({
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
    paymentType: "lightning",
    settlementAmount,
    settlementAmountIsEstimated: settlementAmount && false,
    unitOfAccountAmount,
    sendingWalletDescriptor,
    setAmount,
    setMemo,
    getFee,
    sendPayment,
    setSendingWalletDescriptor,
    setUnitOfAccount,
  } as const
}

export type CreateAmountLightningPaymentDetailsParams<T extends WalletCurrency> = {
  paymentRequest: string
  paymentRequestAmount: BtcPaymentAmount
  unitOfAccount: WalletCurrency
} & BaseCreatePaymentDetailsParams<T>

export const CreateAmountLightningPaymentDetails = <T extends WalletCurrency>(
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
  const settlementAmount =
    unitOfAccountAmount &&
    convertPaymentAmount(paymentRequestAmount, sendingWalletDescriptor.currency)

  const sendPayment: SendPayment =
    (async (sendPaymentFns) => {
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
    })

  let getFee: GetFee<T> | undefined = undefined

  if (sendingWalletDescriptor.currency === "BTC") {
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

  const setMemo: SetMemo<T> | undefined = destinationSpecifiedMemo
    ? undefined
    : (newMemo) => {
        return {
          ...CreateAmountLightningPaymentDetails({
            ...params,
            senderSpecifiedMemo: newMemo,
          }),
          getFee,
        }
      }

  const setConvertPaymentAmount = (newConvertPaymentAmount: ConvertPaymentAmount) => {
    return CreateAmountLightningPaymentDetails({
      ...params,
      convertPaymentAmount: newConvertPaymentAmount,
    })
  }

  const setSendingWalletDescriptor: SetSendingWalletDescriptor<T> = (
    newSendingWalletDescriptor,
  ) => {
    return CreateAmountLightningPaymentDetails({
      ...params,
      sendingWalletDescriptor: newSendingWalletDescriptor,
    })
  }

  const setUnitOfAccount: SetUnitOfAccount<T> = (_) => {
    return CreateAmountLightningPaymentDetails({
      ...params,
      unitOfAccount,
    })
  }

  return {
    destination: paymentRequest,
    destinationSpecifiedAmount: paymentRequestAmount,
    convertPaymentAmount,
    memo,
    paymentType: "lightning",
    settlementAmount,
    settlementAmountIsEstimated: sendingWalletDescriptor.currency !== "BTC",
    sendingWalletDescriptor,
    unitOfAccountAmount,
    setMemo,
    setSendingWalletDescriptor,
    setUnitOfAccount,
    setConvertPaymentAmount,
    sendPayment,
    getFee,
  } as const
}

export type CreateLnurlPaymentDetailsParams<T extends WalletCurrency> = {
  lnurl: string
  lnurlParams: LnUrlPayServiceResponse
  paymentRequest?: string
  paymentRequestAmount?: BtcPaymentAmount
  unitOfAccountAmount?: PaymentAmount<WalletCurrency>
} & BaseCreatePaymentDetailsParams<T>

export const CreateLnurlPaymentDetails = <T extends WalletCurrency>(
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

  let amountLightningPaymentDetails: PaymentDetail<T> | undefined = undefined

  let settlementAmount: PaymentAmount<T> | undefined = undefined
  if (paymentRequest && paymentRequestAmount && unitOfAccountAmount) {
    amountLightningPaymentDetails = CreateAmountLightningPaymentDetails({
      paymentRequest,
      paymentRequestAmount,
      convertPaymentAmount,
      unitOfAccount: unitOfAccountAmount?.currency,
      sendingWalletDescriptor,
      destinationSpecifiedMemo: memo,
      senderSpecifiedMemo: memo,
    })
    settlementAmount = amountLightningPaymentDetails.settlementAmount
  } else {
    settlementAmount =
      unitOfAccountAmount &&
      convertPaymentAmount(unitOfAccountAmount, sendingWalletDescriptor.currency)
  }

  const setAmount = (newAmount: PaymentAmount<T>) => {
    return CreateLnurlPaymentDetails({
      ...params,
      paymentRequest: undefined,
      paymentRequestAmount: undefined,
      unitOfAccountAmount: newAmount,
    })
  }

  const getFee = amountLightningPaymentDetails?.getFee
  const sendPayment = amountLightningPaymentDetails?.sendPayment
  const setMemo: SetMemo<T> | undefined = destinationSpecifiedMemo
    ? (newMemo) => {
        return {
          ...CreateLnurlPaymentDetails({
            ...params,
            senderSpecifiedMemo: newMemo,
          }),
          getFee,
        }
      }
    : undefined

  const setConvertPaymentAmount = (newConvertPaymentAmount: ConvertPaymentAmount) => {
    return CreateLnurlPaymentDetails({
      ...params,
      convertPaymentAmount: newConvertPaymentAmount,
    })
  }

  const setInvoice: SetInvoice<T> = ({ paymentRequest, paymentRequestAmount }) => {
    return CreateLnurlPaymentDetails({
      ...params,
      paymentRequest,
      paymentRequestAmount,
    })
  }

  const setSendingWalletDescriptor: SetSendingWalletDescriptor<T> = (
    newSendingWalletDescriptor,
  ) => {
    return CreateLnurlPaymentDetails({
      ...params,
      sendingWalletDescriptor: newSendingWalletDescriptor,
    })
  }

  const setUnitOfAccount: SetUnitOfAccount<T> = (newUnitOfAccount) => {
    return CreateLnurlPaymentDetails({
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
    unitOfAccountAmount,
    paymentType: "lnurl",
    destination: lnurl,
    settlementAmount,
    memo,
    settlementAmountIsEstimated: sendingWalletDescriptor.currency !== "BTC",
    setSendingWalletDescriptor,
    setUnitOfAccount,
    setInvoice,
    convertPaymentAmount,
    setConvertPaymentAmount,
    setAmount,
    setMemo,
    getFee,
    sendPayment,
  } as const
}
