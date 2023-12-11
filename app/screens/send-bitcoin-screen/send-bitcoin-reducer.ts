import { Destination, InvalidDestination } from "./payment-destination/index.types"

export enum DestinationState {
  Entering = "entering",
  Pasting = "pasting",
  Validating = "validating",
  Valid = "valid",
  RequiresUsernameConfirmation = "requires-destination-confirmation",
  Invalid = "invalid",
}

export type ConfirmationDestinationType = {
  type: "new-username"
  username: string
}

export type SendBitcoinDestinationState = {
  unparsedDestination: string
  destinationState: DestinationState
  confirmationUsernameType?: ConfirmationDestinationType
  validDestination?: Destination
  invalidDestination?: InvalidDestination
  destination?: Destination
}

export enum SendBitcoinActions {
  SetUnparsedDestination = "set-unparsed-destination",
  SetUnparsedPastedDestination = "set-unparsed-pasted-destination",
  SetValidating = "set-validating",
  SetValid = "set-valid",
  SetInvalid = "set-invalid",
  SetRequiresUsernameConfirmation = "set-requires-destination-confirmation",
  SetConfirmed = "set-confirmed",
}

export type SendBitcoinDestinationAction =
  | {
      type: SendBitcoinActions.SetUnparsedDestination
      payload: { unparsedDestination: string }
    }
  | {
      type: SendBitcoinActions.SetUnparsedPastedDestination
      payload: { unparsedDestination: string }
    }
  | {
      type: SendBitcoinActions.SetValidating
      payload: Record<string, never>
    }
  | {
      type: SendBitcoinActions.SetValid
      payload: {
        validDestination: Destination
        unparsedDestination: string
      }
    }
  | {
      type: SendBitcoinActions.SetInvalid
      payload: {
        invalidDestination: InvalidDestination
        unparsedDestination: string
      }
    }
  | {
      type: SendBitcoinActions.SetRequiresUsernameConfirmation
      payload: {
        confirmationUsernameType: ConfirmationDestinationType
        unparsedDestination: string
        validDestination: Destination
      }
    }
  | {
      type: SendBitcoinActions.SetConfirmed
      payload: { unparsedDestination: string }
    }

export const sendBitcoinDestinationReducer = (
  state: SendBitcoinDestinationState,
  action: SendBitcoinDestinationAction,
): SendBitcoinDestinationState => {
  switch (action.type) {
    case SendBitcoinActions.SetUnparsedPastedDestination:
      return {
        unparsedDestination: action.payload.unparsedDestination,
        destinationState: DestinationState.Pasting,
      }
    case SendBitcoinActions.SetUnparsedDestination:
      return {
        unparsedDestination: action.payload.unparsedDestination,
        destinationState: DestinationState.Entering,
      }
    case SendBitcoinActions.SetValidating:
      return {
        ...state,
        destinationState: DestinationState.Validating,
      }
    case SendBitcoinActions.SetValid:
      return state.unparsedDestination === action.payload?.unparsedDestination
        ? {
            unparsedDestination: state.unparsedDestination,
            destinationState: DestinationState.Valid,
            destination: action.payload.validDestination,
          }
        : state
    case SendBitcoinActions.SetInvalid:
      if (state.destinationState === DestinationState.Validating) {
        return state.unparsedDestination === action.payload?.unparsedDestination
          ? {
              unparsedDestination: state.unparsedDestination,
              destinationState: DestinationState.Invalid,
              invalidDestination: action.payload.invalidDestination,
            }
          : state
      }
      throw new Error("Invalid state transition")
    case SendBitcoinActions.SetRequiresUsernameConfirmation:
      if (state.destinationState === DestinationState.Validating) {
        return state.unparsedDestination === action.payload?.unparsedDestination
          ? {
              unparsedDestination: state.unparsedDestination,
              destinationState: DestinationState.RequiresUsernameConfirmation,
              destination: action.payload.validDestination,
              confirmationUsernameType: action.payload.confirmationUsernameType,
            }
          : state
      }
      throw new Error("Invalid state transition")
    case SendBitcoinActions.SetConfirmed:
      if (state.destinationState === DestinationState.RequiresUsernameConfirmation) {
        return state.unparsedDestination === action.payload?.unparsedDestination
          ? {
              unparsedDestination: state.unparsedDestination,
              destinationState: DestinationState.Valid,
              destination: state.destination,
              confirmationUsernameType: state.confirmationUsernameType,
            }
          : state
      }
      throw new Error("Invalid state transition")
    default:
      return state
  }
}
