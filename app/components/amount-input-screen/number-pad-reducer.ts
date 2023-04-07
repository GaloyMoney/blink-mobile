import { WalletOrDisplayCurrency } from "@app/types/amounts"

export type NumberPadNumber = {
  majorAmount: string
  minorAmount: string
  hasDecimal: boolean
}

export type NumberPadReducerState = {
  numberPadNumber: NumberPadNumber
  numberOfDecimalsAllowed: number
  currency: WalletOrDisplayCurrency
}

export const NumberPadReducerActionType = {
  SetAmount: "SetAmount",
  HandleKeyPress: "HandleKeyPress",
  ClearAmount: "ClearAmount",
} as const

export type NumberPadReducerAction =
  | {
      action: typeof NumberPadReducerActionType.SetAmount
      payload: {
        numberPadNumber: NumberPadNumber
        numberOfDecimalsAllowed: number
        currency: WalletOrDisplayCurrency
      }
    }
  | {
      action: typeof NumberPadReducerActionType.HandleKeyPress
      payload: {
        key: Key
      }
    }
  | {
      action: typeof NumberPadReducerActionType.ClearAmount
    }

export const Key = {
  Backspace: "⌫",
  0: "0",
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  Decimal: ".",
} as const

export type Key = (typeof Key)[keyof typeof Key]

export type NumberPadReducerActionType =
  (typeof NumberPadReducerActionType)[keyof typeof NumberPadReducerActionType]

export const numberPadReducer = (
  state: NumberPadReducerState,
  action: NumberPadReducerAction,
): NumberPadReducerState => {
  const {
    numberPadNumber: { majorAmount, minorAmount, hasDecimal },
    numberOfDecimalsAllowed,
  } = state

  switch (action.action) {
    case NumberPadReducerActionType.SetAmount:
      return action.payload
    case NumberPadReducerActionType.HandleKeyPress:
      if (action.payload.key === Key.Backspace) {
        if (minorAmount.length > 0) {
          return {
            ...state,
            numberPadNumber: {
              majorAmount,
              hasDecimal,
              minorAmount: minorAmount.slice(0, -1),
            },
          }
        }

        if (hasDecimal) {
          return {
            ...state,
            numberPadNumber: {
              majorAmount,
              hasDecimal: false,
              minorAmount,
            },
          }
        }

        return {
          ...state,
          numberPadNumber: {
            majorAmount: majorAmount.slice(0, -1),
            hasDecimal,
            minorAmount,
          },
        }
      }

      if (action.payload.key === Key.Decimal) {
        if (numberOfDecimalsAllowed > 0) {
          return {
            ...state,
            numberPadNumber: {
              majorAmount,
              minorAmount,
              hasDecimal: true,
            },
          }
        }
        return state
      }

      if (hasDecimal && minorAmount.length < numberOfDecimalsAllowed) {
        return {
          ...state,
          numberPadNumber: {
            majorAmount,
            hasDecimal,
            minorAmount: minorAmount + action.payload.key,
          },
        }
      }

      if (hasDecimal && minorAmount.length >= numberOfDecimalsAllowed) {
        return state
      }

      return {
        ...state,
        numberPadNumber: {
          majorAmount: majorAmount + action.payload.key,
          minorAmount,
          hasDecimal,
        },
      }
    case NumberPadReducerActionType.ClearAmount:
      return {
        ...state,
        numberPadNumber: {
          majorAmount: "",
          minorAmount: "",
          hasDecimal: false,
        },
      }

    default:
      return state
  }
}
