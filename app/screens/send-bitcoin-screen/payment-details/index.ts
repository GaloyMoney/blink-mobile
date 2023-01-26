import { WalletCurrency } from "@app/graphql/generated"
import { ConvertPaymentAmount, PaymentDetail } from "./index.types"
import { ValidPaymentDestination } from "../send-bitcoin-reducer"
import {
  CreateAmountOnchainPaymentDetails,
  CreateNoAmountOnchainPaymentDetails,
} from "./onchain-payment-details"
import { CreateIntraledgerPaymentDetails } from "./intraledger-payment-details"
import {
  CreateAmountLightningPaymentDetails,
  CreateLnurlPaymentDetails,
  CreateNoAmountLightningPaymentDetails,
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

export const CreatePaymentDetails = <T extends WalletCurrency>(
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
        return CreateAmountOnchainPaymentDetails({
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
      return CreateNoAmountOnchainPaymentDetails({
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
      return CreateIntraledgerPaymentDetails({
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
        return CreateAmountLightningPaymentDetails({
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
      return CreateNoAmountLightningPaymentDetails({
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
      return CreateLnurlPaymentDetails({
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
