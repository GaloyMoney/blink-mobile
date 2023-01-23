import * as React from "react"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { saveStorage } from "@app/modules/market-place/utils/helper"
import { ACCESS_TOKEN } from "@app/modules/market-place/config/constant"

type UseTokenReturn = {
  token: string | undefined
  hasToken: boolean
  saveToken: (token: string) => void
  clearToken: () => void
}

export const getAuthorizationHeader = (token: string): string => {
  return `Bearer ${token}`
}

const useToken = (): UseTokenReturn => {
  const { persistentState, updateState } = usePersistentStateContext()

  return React.useMemo(
    () => ({
      token: persistentState.galoyAuthToken,
      hasToken: Boolean(persistentState.galoyAuthToken),
      saveToken: (token: string) => {
        updateState((state) => ({
          ...state,
          galoyAuthToken: token,
        }))
        saveStorage(ACCESS_TOKEN,token)
      },
      clearToken: () => {
        updateState((state) => ({
          ...state,
          galoyAuthToken: "",
        }))
        saveStorage(ACCESS_TOKEN,'')
      },
    }),
    [persistentState.galoyAuthToken, updateState],
  )
}

export default useToken
