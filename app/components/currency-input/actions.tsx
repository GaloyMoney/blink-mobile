import { DisplayAmount, DisplayCurrency } from "@app/types/amounts"

export enum ActionType {
  ADD_DIGIT = "add-digit",
  DELETE_DIGIT = "delete-digit",
  CLEAR_INPUT = "clear-input",
  TOGGLE_PRIMARY_CURRENCY = "toggle-primary-currency",
  UPDATE_CONVERSION_FUNCTION = "update-conversion-function"
}

interface AddDigitAction {
  type: ActionType.ADD_DIGIT
  payload: string
}

export const addDigit = (payload: string): AddDigitAction => ({
  type: ActionType.ADD_DIGIT,
  payload,
})

interface DeleteDigitAction {
  type: ActionType.DELETE_DIGIT
}

export const deleteDigit = (): DeleteDigitAction => ({ type: ActionType.DELETE_DIGIT })

interface ClearInputAction {
  type: ActionType.CLEAR_INPUT
}

export const clearInput = (): ClearInputAction => ({ type: ActionType.CLEAR_INPUT })

interface TogglePrimaryCurrencyAction {
  type: ActionType.TOGGLE_PRIMARY_CURRENCY
}

export const togglePrimaryCurrency = (): TogglePrimaryCurrencyAction => ({
  type: ActionType.TOGGLE_PRIMARY_CURRENCY,
})

interface UpdateConversionFunctionAction {
    type: ActionType.UPDATE_CONVERSION_FUNCTION,
    payload: (displayAmount: DisplayAmount<DisplayCurrency>, toCurrency: DisplayCurrency) => DisplayAmount<DisplayCurrency>
}

export const updateConversionFunction = (conversionFunction: (displayAmount: DisplayAmount<DisplayCurrency>, toCurrency: DisplayCurrency) => DisplayAmount<DisplayCurrency>): UpdateConversionFunctionAction => ({
    type: ActionType.UPDATE_CONVERSION_FUNCTION,
    payload: conversionFunction
})

export type CurrencyInputAction =
  | AddDigitAction
  | DeleteDigitAction
  | ClearInputAction
  | TogglePrimaryCurrencyAction
  | UpdateConversionFunctionAction
