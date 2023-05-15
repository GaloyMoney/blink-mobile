import { createContext, useContext } from "react"

export type AccountLevel = "NonAuth" | "ZERO" | "ONE" | "TWO"

const Level = createContext<{
  isAtLeastLevelZero: boolean
  isAtLeastLevelOne: boolean
  currentLevel: AccountLevel
}>({
  isAtLeastLevelZero: false,
  isAtLeastLevelOne: false,
  currentLevel: "NonAuth",
})

export const LevelContextProvider = Level.Provider

export const useLevel = () => useContext(Level)
