import * as React from "react"
import jwtDecode from "jwt-decode"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { Network } from "@app/graphql/generated"

export const decodeToken: (string) => {
  uid: string
  network: Network
} | null = (token) => {
  try {
    const { uid, network } = jwtDecode<JwtPayload>(token)
    return { uid, network }
  } catch (err) {
    console.debug(err.toString())
    return null
  }
}

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
      },
      clearToken: () => {
        updateState((state) => ({
          ...state,
          galoyAuthToken: "",
        }))
      },
    }),
    [persistentState.galoyAuthToken, updateState],
  )
}

export default useToken
