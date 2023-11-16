import { createContext, useContext } from "react"

const HideAmountContext = createContext<{
  hideAmount: boolean
  switchMemoryHideAmount: () => void
}>({
  hideAmount: false,
  switchMemoryHideAmount: () => {},
})

export const HideAmountContextProvider = HideAmountContext.Provider

export const useHideAmount = () => useContext(HideAmountContext)
