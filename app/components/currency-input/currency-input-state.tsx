import { DisplayAmount, DisplayCurrency } from "@app/types/amounts"

export const ACTIONS = {
  ADD_DIGIT: "add-digit",
  DELETE_DIGIT: "delete-digit",
  CLEAR_INPUT: "clear-input",
  TOGGLE_PRIMARY_CURRENCY: "toggle-primary-currency",
  UPDATE_PRIMARY_DISPLAY_VALUE: "update-primary-display-value",
  UPDATE_SECONDARY_AMOUNT: "update-secondary-amount",
}

export type ACTION_TYPE = {
  type: string
  payload?:
    | string
    | string[]
    | (() => void)
    | boolean
    | undefined
    | number
    | DisplayAmount<DisplayCurrency>
}

type CurrencyInputState = {
  primaryAmount: DisplayAmount<DisplayCurrency>
  secondaryAmount: DisplayAmount<DisplayCurrency>
  enteringMinorCurrencyUnits?: boolean
}

export function currencyInputReducer(
  state: CurrencyInputState,
  { type, payload }: ACTION_TYPE,
) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (payload === "0" && state.primaryAmount.amount === 0) return state
      if (
        payload === "." &&
        (state.primaryAmount.display.includes(".") ||
          state.secondaryAmount.display.includes("."))
      )
        return state
      if (payload === "." && state.primaryAmount.currency === "BTC") return state
      if (state.primaryAmount.amount.toString().length >= 15) return state
      if (state.primaryAmount.currency === DisplayCurrency.BTC) {
        return {
          ...state,
          primaryAmount: {
            ...state.primaryAmount,
            amount: Number(state.primaryAmount.amount.toString() + payload),
          },
        }
      }
      if (payload === ".")
        return {
          ...state,
          enteringMinorCurrencyUnits: true,
        }
      if (state.enteringMinorCurrencyUnits) {
        if (state.primaryAmount.amount.toString().slice(-2) === "00") {
          // Amount currently contains no minor currency units - should initially populate the "tens" digit
          return {
            ...state,
            primaryAmount: {
              ...state.primaryAmount,
              amount: Number(
                state.primaryAmount.amount.toString().slice(0, -2) + payload + "0",
              ),
            },
          }
        }
        if (state.primaryAmount.amount.toString().slice(-1) === "0") {
          // Amount currently contains a value in the "tens" digit, should populate the "hundredths" digit
          return {
            ...state,
            primaryAmount: {
              ...state.primaryAmount,
              amount: Number(
                state.primaryAmount.amount.toString().slice(0, -1) + payload,
              ),
            },
          }
        }
        if (!state.primaryAmount.amount.toString().slice(-2).includes("0")) {
          // Both digits are populated - should do nothing
          return state
        }
        return {
          ...state,
          primaryAmount: {
            ...state.primaryAmount,
            amount: Number(state.primaryAmount.amount.toString() + payload),
          },
        }
      }
      return {
        ...state,
        primaryAmount: {
          ...state.primaryAmount,
          amount: state.primaryAmount.amount.toString().endsWith("00")
            ? Number(state.primaryAmount.amount.toString().slice(0, -2) + payload + "00")
            : Number(state.primaryAmount.amount.toString() + payload + "00"),
        },
      }
    case ACTIONS.DELETE_DIGIT:
      if (state.primaryAmount.currency === DisplayCurrency.BTC) {
        return {
          ...state,
          primaryAmount: {
            ...state.primaryAmount,
            amount: Number(state.primaryAmount.amount.toString().slice(0, -1)),
          },
        }
      }
      if (
        state.enteringMinorCurrencyUnits &&
        state.primaryAmount.amount.toString().slice(-2) === "00"
      ) {
        // No minor currency units in the current state
        return { ...state, enteringMinorCurrencyUnits: false }
      }
      if (
        state.enteringMinorCurrencyUnits &&
        state.primaryAmount.amount.toString().slice(-1) === "0"
      ) {
        // Hundredth digit is currently 0, we should replace the "tens" digit with 0,
        return {
          ...state,
          primaryAmount: {
            ...state.primaryAmount,
            amount: Number(state.primaryAmount.amount.toString().slice(0, -2) + "00"),
          },
        }
      }
      if (
        state.enteringMinorCurrencyUnits &&
        state.primaryAmount.amount.toString().slice(-1) !== "0"
      ) {
        // Hundredth digit is currently not 0, we should replace the hundredths digit with 0,
        return {
          ...state,
          primaryAmount: {
            ...state.primaryAmount,
            amount: Number(state.primaryAmount.amount.toString().slice(0, -1) + "0"),
          },
        }
      }
      if (
        !state.enteringMinorCurrencyUnits &&
        state.primaryAmount.amount.toString().slice(-2) === "00"
      ) {
        // No minor currency units in the current state
        return {
          ...state,
          primaryAmount: {
            ...state.primaryAmount,
            amount: Number(state.primaryAmount.amount.toString().slice(0, -3) + "00"),
          },
        }
      }
      return {
        ...state,
        primaryAmount: {
          ...state.primaryAmount,
          amount: Number(state.primaryAmount.amount.toString().slice(0, -1)),
        },
      }
    case ACTIONS.CLEAR_INPUT:
      return {
        ...state,
        primaryAmount: {
          ...state.primaryAmount,
          amount: 0,
        },
      }
    case ACTIONS.UPDATE_PRIMARY_DISPLAY_VALUE:
      return {
        ...state,
        primaryAmount: {
          ...state.primaryAmount,
          display: payload as string,
        },
      }
    case ACTIONS.TOGGLE_PRIMARY_CURRENCY:
      if (
        state.primaryAmount.currency === DisplayCurrency.BTC &&
        state.secondaryAmount.amount.toString().slice(-2) !== "00"
      ) {
        // Switching from BTC as primary currency and secondary amount has minor currency units
        return {
          ...state,
          primaryAmount: { ...state.secondaryAmount },
          secondaryAmount: { ...state.primaryAmount },
          enteringMinorCurrencyUnits: true,
        }
      }
      if (
        state.secondaryAmount.currency === DisplayCurrency.BTC &&
        state.enteringMinorCurrencyUnits
      ) {
        // Switching to BTC as the primary currency which doesn't have minor currency units
        return {
          ...state,
          primaryAmount: { ...state.secondaryAmount },
          secondaryAmount: { ...state.primaryAmount },
          enteringMinorCurrencyUnits: false,
        }
      }
      return {
        ...state,
        primaryAmount: { ...state.secondaryAmount },
        secondaryAmount: { ...state.primaryAmount },
      }
    case ACTIONS.UPDATE_SECONDARY_AMOUNT:
      return {
        ...state,
        secondaryAmount: payload as DisplayAmount<DisplayCurrency>,
      }
    default:
      return state
  }
}
