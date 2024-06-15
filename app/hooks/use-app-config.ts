import { useCallback, useMemo } from "react"

import { GaloyInstance, resolveGaloyInstanceOrDefault } from "@app/config"
import { usePersistentStateContext } from "@app/store/persistent-state"

export const useAppConfig = () => {
  const { persistentState, updateState } = usePersistentStateContext()

  const appConfig = useMemo(
    () => ({
      token: persistentState.galoyAuthToken,
      galoyInstance: resolveGaloyInstanceOrDefault(persistentState.galoyInstance),
      allTokens: persistentState.galoyAllAuthTokens,
    }),
    [
      persistentState.galoyAuthToken,
      persistentState.galoyInstance,
      persistentState.galoyAllAuthTokens,
    ],
  )

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
            galoyAllAuthTokens: [...state.galoyAllAuthTokens, token],
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
            galoyAllAuthTokens: [...state.galoyAllAuthTokens, token],
          }
        return undefined
      })
    },
    [updateState],
  )

  return {
    appConfig,
    setGaloyInstance,
    saveToken,
    saveTokenAndInstance,
  }
}
