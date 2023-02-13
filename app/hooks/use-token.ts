import * as React from "react"
import { usePersistentStateContext } from "@app/store/persistent-state"

export const getAuthorizationHeader = (token: string): string => {
  return `Bearer ${token}`
}

const useToken = () => {
  const { persistentState, updateState } = usePersistentStateContext()

  return React.useMemo(
    () => ({
      token: persistentState.galoyAuthToken,
      saveToken: (token: string) => {
        updateState((state) => {
          if (state)
            return {
              ...state,
              galoyAuthToken: token,
            }
          return undefined
        })
      },
    }),
    [persistentState.galoyAuthToken, updateState],
  )
}

export default useToken
