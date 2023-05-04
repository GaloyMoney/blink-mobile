import { createContext, useContext } from "react"

type AccountLevel = "NonAuth" | "ZERO" | "ONE" | "TWO"

const Level = createContext<{
  isLevel0: boolean
  isLevel1: boolean
  currentLevel: AccountLevel
}>({
  isLevel0: false,
  isLevel1: false,
  currentLevel: "NonAuth",
})

export const LevelContextProvider = Level.Provider

export const useLevel = () => useContext(Level)
