import { loadJson, saveJson } from "@app/utils/storage"
import { createContext, useContext } from "react"
import {
  defaultPersistentState,
  deserializeAndMigratePersistentState,
  PersistentState,
} from "./state-migrations"
import * as React from "react"

const PERSISTENT_STATE_KEY = "persistentState"

const loadPersistentState = async (): Promise<PersistentState> => {
  const data = await loadJson(PERSISTENT_STATE_KEY)
  return deserializeAndMigratePersistentState(data)
}

const savePersistentState = async (state: PersistentState) => {
  return saveJson(PERSISTENT_STATE_KEY, state)
}

export type PersistentStateContextType = {
  persistentState: PersistentState
  updateState: (update: (state: PersistentState) => PersistentState) => void
  resetState: () => void
}

export const PersistentStateContext = createContext<PersistentStateContextType>(undefined)

export const PersistentStateProvider = ({ children }) => {
  const [persistentState, setPersistentState] = React.useState<PersistentState>()
  const [isLoaded, setIsLoaded] = React.useState(false)

  React.useEffect(() => {
    if (persistentState) {
      savePersistentState(persistentState)
    }
  }, [persistentState])

  React.useEffect(() => {
    loadPersistentState().then((persistentState) => {
      setPersistentState(persistentState)
      setIsLoaded(true)
    })
  }, [])

  const resetState = React.useCallback(() => {
    setPersistentState(defaultPersistentState)
  }, [])

  return isLoaded ? (
    <PersistentStateContext.Provider
      value={{ persistentState, updateState: setPersistentState, resetState }}
    >
      {children}
    </PersistentStateContext.Provider>
  ) : null
}

export const usePersistentStateContext = () => useContext(PersistentStateContext)
