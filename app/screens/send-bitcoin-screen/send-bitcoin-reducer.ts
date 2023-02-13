import {
  IntraledgerPaymentDestination,
  LightningPaymentDestination,
  LnurlPaymentDestination,
  OnchainPaymentDestination,
  ParsedPaymentDestination,
} from "@galoymoney/client/dist/parsing-v2"
import { LnUrlPayServiceResponse } from "lnurl-pay/dist/types/types"

export type DestinationState =
  | "entering"
  | "validating"
  | "valid"
  | "requires-confirmation"
  | "invalid"

export type ConfirmationType = {
  type: "new-username"
  username: string
}

export type InvalidDestinationReason =
  | "unknown-destination"
  | "expired-invoice"
  | "wrong-network"
  | "invalid-amount"
  | "username-does-not-exist"
  | "self-payment"
  | "lnurl-error"
  | "unknown-lightning"
  | "unknown-onchain"

export type SendBitcoinDestinationState =
  | {
      unparsedDestination: string
      destinationState: "entering"
    }
  | {
      unparsedDestination: string
      destinationState: "validating"
      parsedPaymentDestination: ParsedPaymentDestination
    }
  | {
      unparsedDestination: string
      destinationState: "valid"
      destination: ValidPaymentDestination
      confirmationType?: ConfirmationType
    }
  | {
      unparsedDestination: string
      destinationState: "requires-confirmation"
      destination: ValidPaymentDestination
      confirmationType: ConfirmationType
    }
  | {
      unparsedDestination: string
      destinationState: "invalid"
      invalidReason: InvalidDestinationReason
      parsedPaymentDestination: ParsedPaymentDestination
    }

export type ResolvedIntraledgerPaymentDestination = IntraledgerPaymentDestination & {
  valid: true
} & { walletId: string }

export type ResolvedLnurlPaymentDestination = LnurlPaymentDestination & {
  lnurlParams: LnUrlPayServiceResponse
}

export type ValidPaymentDestination = (
  | ResolvedLnurlPaymentDestination
  | LightningPaymentDestination
  | OnchainPaymentDestination
  | ResolvedIntraledgerPaymentDestination
) & { valid: true }

export type SendBitcoinDestinationAction =
  | { type: "set-unparsed-destination"; payload: { unparsedDestination: string } }
  | {
      type: "set-validating"
      payload: {
        parsedDestination: ParsedPaymentDestination
        unparsedDestination: string
      }
    }
  | {
      type: "set-valid"
      payload: { validDestination: ValidPaymentDestination; unparsedDestination: string }
    }
  | {
      type: "set-invalid"
      payload: {
        invalidDestinationReason: InvalidDestinationReason
        unparsedDestination: string
      }
    }
  | {
      type: "set-requires-confirmation"
      payload: {
        confirmationType: ConfirmationType
        unparsedDestination: string
        validDestination: ValidPaymentDestination
      }
    }
  | { type: "set-confirmed"; payload: { unparsedDestination: string } }

export const sendBitcoinDestinationReducer = (
  state: SendBitcoinDestinationState,
  action: SendBitcoinDestinationAction,
): SendBitcoinDestinationState => {
  if (
    action.type !== "set-unparsed-destination" &&
    state.unparsedDestination !== action.payload.unparsedDestination
  ) {
    return state
  }

  switch (action.type) {
    case "set-unparsed-destination":
      return {
        unparsedDestination: action.payload.unparsedDestination,
        destinationState: "entering",
      }
    case "set-validating":
      return {
        unparsedDestination: state.unparsedDestination,
        destinationState: "validating",
        parsedPaymentDestination: action.payload.parsedDestination,
      }
    case "set-valid":
      return {
        unparsedDestination: state.unparsedDestination,
        destinationState: "valid",
        destination: action.payload.validDestination,
      }
    case "set-invalid":
      if (state.destinationState === "validating") {
        return {
          unparsedDestination: state.unparsedDestination,
          destinationState: "invalid",
          invalidReason: action.payload.invalidDestinationReason,
          parsedPaymentDestination: state.parsedPaymentDestination,
        }
      }
      throw new Error("Invalid state transition")
    case "set-requires-confirmation":
      if (state.destinationState === "validating") {
        return {
          unparsedDestination: state.unparsedDestination,
          destinationState: "requires-confirmation",
          destination: action.payload.validDestination,
          confirmationType: action.payload.confirmationType,
        }
      }
      throw new Error("Invalid state transition")
    case "set-confirmed":
      if (state.destinationState === "requires-confirmation") {
        return {
          unparsedDestination: state.unparsedDestination,
          destinationState: "valid",
          destination: state.destination,
          confirmationType: state.confirmationType,
        }
      }
      throw new Error("Invalid state transition")
  }
}
