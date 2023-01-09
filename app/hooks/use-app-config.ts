import { GaloyInstance } from "@app/config"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { useCallback, useMemo } from "react"

export type AppConfiguration = {
  isUsdDisabled: boolean
  galoyInstance: GaloyInstance
}

export const useAppConfig = () => {
  const { persistentState, updateState } = usePersistentStateContext()

  const appConfig = useMemo(() => {
    return {
      isUsdDisabled: persistentState.isUsdDisabled,
      galoyInstance: persistentState.galoyInstance,
    }
  }, [persistentState.isUsdDisabled, persistentState.galoyInstance])

  const toggleUsdDisabled = useCallback(() => {
    updateState((state) => ({
      ...state,
      isUsdDisabled: !state.isUsdDisabled,
    }))
  }, [updateState])

  const setGaloyInstance = useCallback(
    (newInstance: GaloyInstance) => {
      updateState((state) => ({
        ...state,
        galoyInstance: newInstance,
      }))
    },
    [updateState],
  )

  return { appConfig, toggleUsdDisabled, setGaloyInstance }
}
