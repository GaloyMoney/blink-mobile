import { WalletCurrency } from "@app/graphql/generated"
import {
  InvalidLightningDestinationReason,
  LightningPaymentDestination,
} from "@galoymoney/client/dist/parsing-v2"
import {
  createAmountLightningPaymentDetails,
  createNoAmountLightningPaymentDetails,
} from "../payment-details"
import {
  CreatePaymentDetailParams,
  DestinationDirection,
  InvalidDestinationReason,
  ParseDestinationResult,
  PaymentDestination,
} from "./index.types"

export const resolveLightningDestination = (
  parsedLightningDestination: LightningPaymentDestination,
): ParseDestinationResult => {
  if (parsedLightningDestination.valid === true) {
    return createLightningDestination(parsedLightningDestination)
  }

  return {
    valid: false,
    invalidPaymentDestination: parsedLightningDestination,
    invalidReason: mapInvalidReason(parsedLightningDestination.invalidReason),
  }
}

export const createLightningDestination = (
  parsedLightningDestination: LightningPaymentDestination & { valid: true },
): PaymentDestination => {
  const { paymentRequest, amount, memo } = parsedLightningDestination

  let createPaymentDetail

  if (amount) {
    createPaymentDetail = <T extends WalletCurrency>({
      convertMoneyAmount,
      sendingWalletDescriptor,
    }: CreatePaymentDetailParams<T>) => {
      return createAmountLightningPaymentDetails({
        paymentRequest,
        sendingWalletDescriptor,
        paymentRequestAmount: {
          amount,
          currency: WalletCurrency.Btc,
        },
        convertMoneyAmount,
        destinationSpecifiedMemo: memo,
      })
    }
  } else {
    createPaymentDetail = <T extends WalletCurrency>({
      convertMoneyAmount,
      sendingWalletDescriptor,
    }: CreatePaymentDetailParams<T>) => {
      return createNoAmountLightningPaymentDetails({
        paymentRequest,
        sendingWalletDescriptor,
        convertMoneyAmount,
        destinationSpecifiedMemo: memo,
        unitOfAccountAmount: {
          amount: 0,
          currency: WalletCurrency.Btc,
        },
      })
    }
  }

  return {
    valid: true,
    destinationDirection: DestinationDirection.Send,
    validDestination: parsedLightningDestination,
    createPaymentDetail,
  }
}

const mapInvalidReason = (
  invalidLightningReason: InvalidLightningDestinationReason,
): InvalidDestinationReason => {
  switch (invalidLightningReason) {
    case InvalidLightningDestinationReason.InvoiceExpired:
      return InvalidDestinationReason.InvoiceExpired
    case InvalidLightningDestinationReason.WrongNetwork:
      return InvalidDestinationReason.WrongNetwork
    case InvalidLightningDestinationReason.Unknown:
      return InvalidDestinationReason.UnknownLightning
  }
}
