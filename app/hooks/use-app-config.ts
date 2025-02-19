import { useCallback, useMemo } from "react"

import { GaloyInstance, resolveGaloyInstanceOrDefault } from "@app/config"
import { usePersistentStateContext } from "@app/store/persistent-state"
import KeyStoreWrapper from "../utils/storage/secureStorage"

export const useAppConfig = () => {
  const { persistentState, updateState } = usePersistentStateContext()

  const appConfig = useMemo(
    () => ({
      token: persistentState.galoyAuthToken,
      galoyInstance: resolveGaloyInstanceOrDefault(persistentState.galoyInstance),
    }),
    [persistentState.galoyAuthToken, persistentState.galoyInstance],
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
    async (token: string) => {
      await setAllToken(token)
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
    async ({ token, instance }: { token: string; instance: GaloyInstance }) => {
      await setAllToken(token)
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

  const setAllToken = async (token: string): Promise<string> => {
    await KeyStoreWrapper.setAllTokens(token)
    return token
  }

  return {
    appConfig,
    setGaloyInstance,
    saveToken,
    saveTokenAndInstance,
  }
}
