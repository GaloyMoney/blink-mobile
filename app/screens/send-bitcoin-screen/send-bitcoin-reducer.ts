import { Destination, InvalidDestination } from "./payment-destination/index.types"

export const DestinationState = {
  Entering: "entering",
  Validating: "validating",
  Valid: "valid",
  RequiresUsernameConfirmation: "requires-destination-confirmation",
  Invalid: "invalid",
} as const

export type DestinationState = (typeof DestinationState)[keyof typeof DestinationState]

export type ConfirmationDestinationType = {
  type: "new-username"
  username: string
}

export type SendBitcoinDestinationState =
  | {
      unparsedDestination: string
      destinationState:
        | typeof DestinationState.Entering
        | typeof DestinationState.Validating
    }
  | {
      unparsedDestination: string
      destinationState: typeof DestinationState.Valid
      destination: Destination
      confirmationUsernameType?: ConfirmationDestinationType
    }
  | {
      unparsedDestination: string
      destinationState: typeof DestinationState.RequiresUsernameConfirmation
      destination: Destination
      confirmationUsernameType: ConfirmationDestinationType
    }
  | {
      unparsedDestination: string
      destinationState: typeof DestinationState.Invalid
      invalidDestination: InvalidDestination
    }

export const SendBitcoinActions = {
  SetUnparsedDestination: "set-unparsed-destination",
  SetValidating: "set-validating",
  SetValid: "set-valid",
  SetInvalid: "set-invalid",
  SetRequiresUsernameConfirmation: "set-requires-destination-confirmation",
  SetConfirmed: "set-confirmed",
} as const

export type SendBitcoinActions =
  (typeof SendBitcoinActions)[keyof typeof SendBitcoinActions]

export type SendBitcoinDestinationAction =
  | {
      type: typeof SendBitcoinActions.SetUnparsedDestination
      payload: { unparsedDestination: string }
    }
  | {
      type: typeof SendBitcoinActions.SetValidating
      payload: {
        unparsedDestination: string
      }
    }
  | {
      type: typeof SendBitcoinActions.SetValid
      payload: {
        validDestination: Destination
        unparsedDestination: string
      }
    }
  | {
      type: typeof SendBitcoinActions.SetInvalid
      payload: {
        invalidDestination: InvalidDestination
        unparsedDestination: string
      }
    }
  | {
      type: typeof SendBitcoinActions.SetRequiresUsernameConfirmation
      payload: {
        confirmationUsernameType: ConfirmationDestinationType
        unparsedDestination: string
        validDestination: Destination
      }
    }
  | {
      type: typeof SendBitcoinActions.SetConfirmed
      payload: { unparsedDestination: string }
    }

export const sendBitcoinDestinationReducer = (
  state: SendBitcoinDestinationState,
  action: SendBitcoinDestinationAction,
): SendBitcoinDestinationState => {
  if (
    action.type !== SendBitcoinActions.SetUnparsedDestination &&
    state.unparsedDestination !== action.payload.unparsedDestination
  ) {
    return state
  }

  switch (action.type) {
    case SendBitcoinActions.SetUnparsedDestination:
      return {
        unparsedDestination: action.payload.unparsedDestination,
        destinationState: DestinationState.Entering,
      }
    case SendBitcoinActions.SetValidating:
      return {
        unparsedDestination: state.unparsedDestination,
        destinationState: DestinationState.Validating,
      }
    case SendBitcoinActions.SetValid:
      return {
        unparsedDestination: state.unparsedDestination,
        destinationState: DestinationState.Valid,
        destination: action.payload.validDestination,
      }
    case SendBitcoinActions.SetInvalid:
      if (state.destinationState === DestinationState.Validating) {
        return {
          unparsedDestination: state.unparsedDestination,
          destinationState: DestinationState.Invalid,
          invalidDestination: action.payload.invalidDestination,
        }
      }
      throw new Error("Invalid state transition")
    case SendBitcoinActions.SetRequiresUsernameConfirmation:
      if (state.destinationState === DestinationState.Validating) {
        return {
          unparsedDestination: state.unparsedDestination,
          destinationState: DestinationState.RequiresUsernameConfirmation,
          destination: action.payload.validDestination,
          confirmationUsernameType: action.payload.confirmationUsernameType,
        }
      }
      throw new Error("Invalid state transition")
    case SendBitcoinActions.SetConfirmed:
      if (state.destinationState === DestinationState.RequiresUsernameConfirmation) {
        return {
          unparsedDestination: state.unparsedDestination,
          destinationState: DestinationState.Valid,
          destination: state.destination,
          confirmationUsernameType: state.confirmationUsernameType,
        }
      }
      throw new Error("Invalid state transition")
  }
}
