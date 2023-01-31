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
    updateState((state) => {
      if (state)
        return {
          ...state,
          isUsdDisabled: !state.isUsdDisabled,
        }
      return undefined
    })
  }, [updateState])

  const setGaloyInstance = useCallback(
    (newInstance: GaloyInstance) => {
      updateState((state) => {
        if (state)
          return {
            ...state,
            galoyInstance: newInstance,
          }
        return undefined
      })
    },
    [updateState],
  )

  return { appConfig, toggleUsdDisabled, setGaloyInstance }
}
