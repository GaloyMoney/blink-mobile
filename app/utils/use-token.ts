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
    console.log({ uid, network })
    return { uid, network }
  } catch (err) {
    console.log(err.toString())
    return null
  }
}

type UseTokenReturn = {
  saveToken: (token: string) => Promise<boolean>
  removeToken: () => Promise<void>
  getToken: () => string | null
  getTokenUid: () => string | null
  getNetwork: () => Promise<INetwork | null>
  hasToken: () => boolean
  network: INetwork | null
}

const useToken = (): UseTokenReturn => {
  const authToken = useReactiveVar<TokenPayload | null>(authTokenVar)

  return React.useMemo(
    () => ({
      saveToken: async (token: string) => {
        const { uid, network } = decodeToken(token)
        authTokenVar({ token, uid, network })
        return saveString(TOKEN_KEY, token)
      },
      removeToken: async () => {
        authTokenVar(null)
        removeString(TOKEN_KEY)
      },
      getToken: () => {
        return authToken?.token
      },
      getTokenUid: () => {
        return authToken?.uid
      },
      hasToken: () => {
        return authToken?.token !== null
      },
      getNetwork: async () => {
        if (authToken?.token !== null) {
          return Promise.resolve(authToken?.network)
        } else {
          return loadNetwork()
        }
      },
      network: authToken?.network,
    }),
    [authToken],
  )
}

export default useToken
