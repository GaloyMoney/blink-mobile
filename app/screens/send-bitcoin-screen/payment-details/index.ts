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

export * from "./onchain-payment-details"
export * from "./intraledger-payment-details"
export * from "./index.types"

export const CreatePaymentDetails = (
  validPaymentDestination: ValidPaymentDestination,
  convertPaymentAmount: ConvertPaymentAmount,
): PaymentDetail<WalletCurrency> => {
  switch (validPaymentDestination.paymentType) {
    case "onchain":
      if (validPaymentDestination.amount) {
        return CreateAmountOnchainPaymentDetails({
          address: validPaymentDestination.address,
          destinationSpecifiedAmount: {
            amount: validPaymentDestination.amount,
            currency: "BTC",
          },
          convertPaymentAmount,
          destinationSpecifiedMemo: validPaymentDestination.memo,
          unitOfAccount: "USD",
        })
      }
      return CreateNoAmountOnchainPaymentDetails({
        address: validPaymentDestination.address,
        convertPaymentAmount,
        destinationSpecifiedMemo: validPaymentDestination.memo,
        unitOfAccountAmount: {
          amount: 0,
          currency: "USD",
        },
      })

    case "intraledger":
      return CreateIntraledgerPaymentDetails({
        handle: validPaymentDestination.handle,
        recipientWalletId: validPaymentDestination.walletId,
        convertPaymentAmount,
        unitOfAccountAmount: {
          amount: 0,
          currency: "USD",
        },
      })
    case "lightning":
      if (validPaymentDestination.amount) {
        return CreateAmountLightningPaymentDetails({
          paymentRequest: validPaymentDestination.paymentRequest,
          paymentRequestAmount: {
            amount: validPaymentDestination.amount,
            currency: "BTC",
          },
          convertPaymentAmount,
          destinationSpecifiedMemo: validPaymentDestination.memo,
          unitOfAccount: "USD",
        })
      }
      return CreateNoAmountLightningPaymentDetails({
        paymentRequest: validPaymentDestination.paymentRequest,
        convertPaymentAmount,
        destinationSpecifiedMemo: validPaymentDestination.memo,
        unitOfAccountAmount: {
          amount: 0,
          currency: "USD",
        },
      })

    case "lnurl":
      return CreateLnurlPaymentDetails({
        lnurl: validPaymentDestination.lnurl,
        lnurlParams: validPaymentDestination.lnurlParams,
        convertPaymentAmount,
        unitOfAccountAmount: {
          amount: 0,
          currency: "USD",
        },
      })
  }
}
