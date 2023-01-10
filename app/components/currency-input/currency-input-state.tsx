import { DisplayAmount, DisplayCurrency } from "@app/types/amounts"
import { ActionType, CurrencyInputAction } from "./actions"

type CurrencyInputState = {
  primaryAmount: DisplayAmount<DisplayCurrency>
  secondaryAmount: DisplayAmount<DisplayCurrency>
  conversionFunction: (
    displayAmount: DisplayAmount<DisplayCurrency>,
    toCurrency: DisplayCurrency,
  ) => DisplayAmount<DisplayCurrency>
  enteringMinorCurrencyUnits?: boolean
}

export function currencyInputReducer(
  state: CurrencyInputState,
  action: CurrencyInputAction,
): CurrencyInputState {
  switch (action.type) {
    case ActionType.ADD_DIGIT:
      if (action.payload === "0" && state.primaryAmount.amount === 0) return state
      if (action.payload === "." && !Number.isInteger(state.primaryAmount.amount))
        return state
      if (action.payload === "." && state.primaryAmount.currency === "BTC") return state
      if (state.primaryAmount.amount.toString().length >= 15) return state
      if (state.primaryAmount.currency === DisplayCurrency.BTC) {
        return {
          ...state,
          primaryAmount: {
            ...state.primaryAmount,
            amount: Number(state.primaryAmount.amount.toString() + action.payload),
          },
          secondaryAmount: state.conversionFunction(
            {
              ...state.primaryAmount,
              amount: Number(state.primaryAmount.amount.toString() + action.payload),
            },
            state.secondaryAmount.currency,
          ),
        }
      }
      if (action.payload === ".")
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
                state.primaryAmount.amount.toString().slice(0, -2) + action.payload + "0",
              ),
            },
            secondaryAmount: state.conversionFunction(
              {
                ...state.primaryAmount,
                amount: Number(
                  state.primaryAmount.amount.toString().slice(0, -2) +
                    action.payload +
                    "0",
                ),
              },
              state.secondaryAmount.currency,
            ),
          }
        }
        if (state.primaryAmount.amount.toString().slice(-1) === "0") {
          // Amount currently contains a value in the "tens" digit, should populate the "hundredths" digit
          return {
            ...state,
            primaryAmount: {
              ...state.primaryAmount,
              amount: Number(
                state.primaryAmount.amount.toString().slice(0, -1) + action.payload,
              ),
            },
            secondaryAmount: state.conversionFunction(
              {
                ...state.primaryAmount,
                amount: Number(
                  state.primaryAmount.amount.toString().slice(0, -1) + action.payload,
                ),
              },
              state.secondaryAmount.currency,
            ),
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
            amount: Number(state.primaryAmount.amount.toString() + action.payload),
          },
          secondaryAmount: state.conversionFunction(
            {
              ...state.primaryAmount,
              amount: Number(state.primaryAmount.amount.toString() + action.payload),
            },
            state.secondaryAmount.currency,
          ),
        }
      }
      return {
        ...state,
        primaryAmount: {
          ...state.primaryAmount,
          amount: state.primaryAmount.amount.toString().endsWith("00")
            ? Number(
                state.primaryAmount.amount.toString().slice(0, -2) +
                  action.payload +
                  "00",
              )
            : Number(state.primaryAmount.amount.toString() + action.payload + "00"),
        },
        secondaryAmount: state.conversionFunction(
          {
            ...state.primaryAmount,
            amount: state.primaryAmount.amount.toString().endsWith("00")
              ? Number(
                  state.primaryAmount.amount.toString().slice(0, -2) +
                    action.payload +
                    "00",
                )
              : Number(state.primaryAmount.amount.toString() + action.payload + "00"),
          },
          state.secondaryAmount.currency,
        ),
      }
    case ActionType.DELETE_DIGIT:
      if (state.primaryAmount.currency === DisplayCurrency.BTC) {
        return {
          ...state,
          primaryAmount: {
            ...state.primaryAmount,
            amount: Number(state.primaryAmount.amount.toString().slice(0, -1)),
          },
          secondaryAmount: state.conversionFunction(
            {
              ...state.primaryAmount,
              amount: Number(state.primaryAmount.amount.toString().slice(0, -1)),
            },
            state.secondaryAmount.currency,
          ),
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
          secondaryAmount: state.conversionFunction(
            {
              ...state.primaryAmount,
              amount: Number(state.primaryAmount.amount.toString().slice(0, -2) + "00"),
            },
            state.secondaryAmount.currency,
          ),
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
          secondaryAmount: state.conversionFunction(
            {
              ...state.primaryAmount,
              amount: Number(state.primaryAmount.amount.toString().slice(0, -1) + "0"),
            },
            state.secondaryAmount.currency,
          ),
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
          secondaryAmount: state.conversionFunction(
            {
              ...state.primaryAmount,
              amount: Number(state.primaryAmount.amount.toString().slice(0, -3) + "00"),
            },
            state.secondaryAmount.currency,
          ),
        }
      }
      return {
        ...state,
        primaryAmount: {
          ...state.primaryAmount,
          amount: Number(state.primaryAmount.amount.toString().slice(0, -1)),
        },
        secondaryAmount: state.conversionFunction(
          {
            ...state.primaryAmount,
            amount: Number(state.primaryAmount.amount.toString().slice(0, -1)),
          },
          state.secondaryAmount.currency,
        ),
      }
    case ActionType.CLEAR_INPUT:
      return {
        ...state,
        primaryAmount: {
          ...state.primaryAmount,
          amount: 0,
        },
        secondaryAmount: {
          ...state.secondaryAmount,
          amount: 0,
        },
      }
    case ActionType.TOGGLE_PRIMARY_CURRENCY:
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
    default:
      return state
  }
}
