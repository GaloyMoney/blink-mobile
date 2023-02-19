import { WalletCurrency } from "@app/graphql/generated"
import {
  InvalidOnchainDestinationReason,
  OnchainPaymentDestination,
} from "@galoymoney/client/dist/parsing-v2"
import {
  createAmountOnchainPaymentDetails,
  createNoAmountOnchainPaymentDetails,
} from "../payment-details"
import {
  CreatePaymentDetailParams,
  DestinationDirection,
  InvalidDestinationReason,
  ParseDestinationResult,
  PaymentDestination,
} from "./index.types"

export const resolveOnchainDestination = (
  parsedOnchainDestination: OnchainPaymentDestination,
): ParseDestinationResult => {
  if (parsedOnchainDestination.valid === true) {
    return createOnchainDestination(parsedOnchainDestination)
  }

  return {
    valid: false,
    invalidPaymentDestination: parsedOnchainDestination,
    invalidReason: mapInvalidReason(parsedOnchainDestination.invalidReason),
  }
}

export const createOnchainDestination = (
  parsedOnchainDestination: OnchainPaymentDestination & { valid: true },
): PaymentDestination => {
  const { address, amount, memo } = parsedOnchainDestination

  let createPaymentDetail

  if (amount) {
    createPaymentDetail = <T extends WalletCurrency>({
      convertPaymentAmount,
      sendingWalletDescriptor,
    }: CreatePaymentDetailParams<T>) => {
      return createAmountOnchainPaymentDetails({
        address,
        sendingWalletDescriptor,
        destinationSpecifiedAmount: {
          amount,
          currency: WalletCurrency.Btc,
        },
        convertPaymentAmount,
        destinationSpecifiedMemo: memo,
      })
    }
  } else {
    createPaymentDetail = <T extends WalletCurrency>({
      convertPaymentAmount,
      sendingWalletDescriptor,
    }: CreatePaymentDetailParams<T>) => {
      return createNoAmountOnchainPaymentDetails({
        address,
        sendingWalletDescriptor,
        convertPaymentAmount,
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
    createPaymentDetail,
    destinationDirection: DestinationDirection.Send,
    validDestination: parsedOnchainDestination,
  }
}

const mapInvalidReason = (
  invalidReason: InvalidOnchainDestinationReason,
): InvalidDestinationReason => {
  switch (invalidReason) {
    case InvalidOnchainDestinationReason.WrongNetwork:
      return InvalidDestinationReason.WrongNetwork
    case InvalidOnchainDestinationReason.InvalidAmount:
      return InvalidDestinationReason.InvalidAmount
    case InvalidOnchainDestinationReason.Unknown:
      return InvalidDestinationReason.UnknownOnchain
  }
}
