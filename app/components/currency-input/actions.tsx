export enum ActionType {
  ADD_DIGIT = "add-digit",
  DELETE_DIGIT = "delete-digit",
  CLEAR_INPUT = "clear-input",
  TOGGLE_PRIMARY_CURRENCY = "toggle-primary-currency",
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

export type CurrencyInputAction =
  | AddDigitAction
  | DeleteDigitAction
  | ClearInputAction
  | TogglePrimaryCurrencyAction
