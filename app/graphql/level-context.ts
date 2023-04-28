import { createContext, useContext } from "react"

type AccountLevel = "NonAuth" | "ZERO" | "ONE" | "TWO"

const Level = createContext<{
  isAtLeaseLevelZero: boolean
  isAtLeaseLevelOne: boolean
  currentLevel: AccountLevel
}>({
  isAtLeaseLevelZero: false,
  isAtLeaseLevelOne: false,
  currentLevel: "NonAuth",
})

export const LevelContextProvider = Level.Provider

export const useLevel = () => useContext(Level)
