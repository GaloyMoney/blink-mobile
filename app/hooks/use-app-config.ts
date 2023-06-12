import { GaloyInstance, resolveGaloyInstanceOrDefault } from "@app/config"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { useCallback, useMemo } from "react"

export const useAppConfig = () => {
  const { persistentState, updateState } = usePersistentStateContext()

  const appConfig = useMemo(
    () => ({
      token: persistentState.galoyAuthToken,
      isAuthenticatedWithDeviceAccount: persistentState.isAuthenticatedWithDeviceAccount,
      galoyInstance: resolveGaloyInstanceOrDefault(persistentState.galoyInstance),
    }),
    [
      persistentState.galoyAuthToken,
      persistentState.galoyInstance,
      persistentState.isAuthenticatedWithDeviceAccount,
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
            isAuthenticatedWithDeviceAccount: false,
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
            isAuthenticatedWithDeviceAccount: false,
          }
        return undefined
      })
    },
    [updateState],
  )

  const setAuthenticatedWithDeviceAccount = useCallback(
    () =>
      updateState((state) => {
        if (state)
          return {
            ...state,
            galoyAuthToken: "",
            isAuthenticatedWithDeviceAccount: true,
          }
        return undefined
      }),
    [updateState],
  )

  return {
    appConfig,
    setGaloyInstance,
    saveToken,
    saveTokenAndInstance,
    setAuthenticatedWithDeviceAccount,
  }
}
