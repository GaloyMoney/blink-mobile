import { GaloyInstance } from "@app/config"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { useCallback, useMemo } from "react"

export type AppConfiguration = {
  isUsdDisabled: boolean
  galoyInstance: GaloyInstance
}

export const useAppConfig = () => {
  const { persistentState, updateState } = usePersistentStateContext()

  const appConfig = useMemo(
    () => ({
      token: persistentState.galoyAuthToken,
      isUsdDisabled: persistentState.isUsdDisabled,
      galoyInstance: persistentState.galoyInstance,
    }),
    [
      persistentState.isUsdDisabled,
      persistentState.galoyInstance,
      persistentState.galoyAuthToken,
    ],
  )

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

  const saveToken = useCallback(
    (token: string) => {
      updateState((state) => {
        if (state)
          return {
            ...state,
            galoyAuthToken: token,
          }
        return undefined
      })
    },
    [updateState],
  )

  const saveTokenAndInstance = useCallback(
    ({ token, instance }: { token: string; instance: GaloyInstance }) => {
      updateState((state) => {
        if (state)
          return {
            ...state,
            galoyInstance: instance,
            galoyAuthToken: token,
          }
        return undefined
      })
    },
    [updateState],
  )

  return {
    appConfig,
    toggleUsdDisabled,
    setGaloyInstance,
    saveToken,
    saveTokenAndInstance,
  }
}
