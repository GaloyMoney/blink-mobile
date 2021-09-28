import * as React from "react"
import { useReactiveVar } from "@apollo/client"
import jwtDecode from "jwt-decode"

import { saveString, remove as removeString } from "./storage"
import type { INetwork } from "../types/network"
import { authTokenVar } from "../graphql/client-only-query"
import { loadNetwork } from "./network"

// key used to stored the token within the phone
export const TOKEN_KEY = "GaloyToken"

const decodeToken = (token) => {
  try {
    const { uid, network } = jwtDecode<JwtPayload>(token)
    return { uid, network }
  } catch (err) {
    console.log(err.toString())
    return null
  }
}

type UseTokenReturn = {
  token: string | null
  tokenUid: string | null
  tokenNetwork: INetwork | null

  saveToken: (token: string) => Promise<boolean>
  removeToken: () => Promise<void>
  hasToken: () => boolean
  getNetwork: () => Promise<INetwork | null>
}

const useToken = (): UseTokenReturn => {
  const authToken = useReactiveVar<TokenPayload | null>(authTokenVar)

  return React.useMemo(
    () => ({
      token: authToken?.token,
      tokenUid: authToken?.uid,
      tokenNetwork: authToken?.network,

      saveToken: async (token: string) => {
        const { uid, network } = decodeToken(token)
        authTokenVar({ token, uid, network })
        return saveString(TOKEN_KEY, token)
      },
      removeToken: async () => {
        authTokenVar(null)
        removeString(TOKEN_KEY)
      },
      hasToken: () => authToken !== null,
      getNetwork: async () => authToken.network ?? loadNetwork(),
    }),
    [authToken],
  )
}

export default useToken
