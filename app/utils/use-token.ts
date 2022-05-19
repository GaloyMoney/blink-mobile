import * as React from "react"
import { useReactiveVar } from "@apollo/client"
import jwtDecode from "jwt-decode"

import { saveString } from "./storage"
import type { INetwork } from "../types/network"
import { authTokenVar } from "../graphql/client-only-query"

// key used to stored the token within the phone
export const TOKEN_KEY = "GaloyToken"

export const decodeToken: (string) => {
  uid: string
  network: INetwork
} = (token) => {
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
  tokenUid: string | undefined
  tokenNetwork: INetwork | undefined
  hasToken: boolean

  saveToken: (token: string) => Promise<boolean>
}

export const getAuthorizationHeader = (): string => {
  const authToken = authTokenVar()
  return authToken?.token ? `Bearer ${authToken?.token}` : ""
}

const useToken = (): UseTokenReturn => {
  const authToken = useReactiveVar<TokenPayload | null>(authTokenVar) // null means there is no user session

  return React.useMemo(
    () => ({
      token: authToken?.token,
      tokenUid: authToken?.uid,
      tokenNetwork: authToken?.network,
      hasToken: Boolean(authToken?.token),

      saveToken: async (token: string) => {
        const { uid, network } = decodeToken(token)
        authTokenVar({ token, uid, network })
        return saveString(TOKEN_KEY, token)
      },
    }),
    [authToken],
  )
}

export default useToken
