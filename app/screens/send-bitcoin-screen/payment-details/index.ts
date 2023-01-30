import { WalletCurrency } from "@app/graphql/generated"
import { ConvertPaymentAmount, PaymentDetail } from "./index.types"
import { ValidPaymentDestination } from "../send-bitcoin-reducer"
import {
  createAmountOnchainPaymentDetails,
  createNoAmountOnchainPaymentDetails,
} from "./onchain-payment-details"
import { createIntraledgerPaymentDetails } from "./intraledger-payment-details"
import {
  createAmountLightningPaymentDetails,
  createLnurlPaymentDetails,
  createNoAmountLightningPaymentDetails,
} from "./lightning-payment-details"
import { WalletDescriptor } from "@app/types/wallets"
import { PaymentType } from "@galoymoney/client/dist/parsing-v2"

export * from "./onchain-payment-details"
export * from "./intraledger-payment-details"
export * from "./index.types"

export type CreatePaymentDetailsParams<T extends WalletCurrency> = {
  validPaymentDestination: ValidPaymentDestination
  convertPaymentAmount: ConvertPaymentAmount
  sendingWalletDescriptor: WalletDescriptor<T>
  unitOfAccount: WalletCurrency
}

export const createPaymentDetails = <T extends WalletCurrency>(
  params: CreatePaymentDetailsParams<T>,
): PaymentDetail<T> => {
  const {
    validPaymentDestination,
    convertPaymentAmount,
    sendingWalletDescriptor,
    unitOfAccount,
  } = params

  switch (validPaymentDestination.paymentType) {
    case PaymentType.Onchain:
      if (validPaymentDestination.amount) {
        return createAmountOnchainPaymentDetails({
          address: validPaymentDestination.address,
          sendingWalletDescriptor,
          destinationSpecifiedAmount: {
            amount: validPaymentDestination.amount,
            currency: WalletCurrency.Btc,
          },
          convertPaymentAmount,
          destinationSpecifiedMemo: validPaymentDestination.memo,
          unitOfAccount,
        })
      }
      return createNoAmountOnchainPaymentDetails({
        address: validPaymentDestination.address,
        sendingWalletDescriptor,
        convertPaymentAmount,
        destinationSpecifiedMemo: validPaymentDestination.memo,
        unitOfAccountAmount: {
          amount: 0,
          currency: unitOfAccount,
        },
      })
    case PaymentType.Intraledger:
      return createIntraledgerPaymentDetails({
        handle: validPaymentDestination.handle,
        recipientWalletId: validPaymentDestination.walletId,
        sendingWalletDescriptor,
        convertPaymentAmount,
        unitOfAccountAmount: {
          amount: 0,
          currency: unitOfAccount,
        },
      })
    case PaymentType.Lightning:
      if (validPaymentDestination.amount) {
        return createAmountLightningPaymentDetails({
          paymentRequest: validPaymentDestination.paymentRequest,
          sendingWalletDescriptor,
          paymentRequestAmount: {
            amount: validPaymentDestination.amount,
            currency: WalletCurrency.Btc,
          },
          convertPaymentAmount,
          destinationSpecifiedMemo: validPaymentDestination.memo,
          unitOfAccount,
        })
      }
      return createNoAmountLightningPaymentDetails({
        paymentRequest: validPaymentDestination.paymentRequest,
        sendingWalletDescriptor,
        convertPaymentAmount,
        destinationSpecifiedMemo: validPaymentDestination.memo,
        unitOfAccountAmount: {
          amount: 0,
          currency: unitOfAccount,
        },
      })

    case PaymentType.Lnurl:
      return createLnurlPaymentDetails({
        lnurl: validPaymentDestination.lnurl,
        lnurlParams: validPaymentDestination.lnurlParams,
        sendingWalletDescriptor,
        convertPaymentAmount,
        unitOfAccountAmount: {
          amount: 0,
          currency: WalletCurrency.Usd,
        },
      })
  }
}
