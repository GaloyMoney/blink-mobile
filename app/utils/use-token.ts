import * as React from "react"
import analytics from "@react-native-firebase/analytics"
import jwtDecode from "jwt-decode"

import { saveString, loadString, remove as removeString } from "./storage"

import type { INetwork } from "../types/network"

// key used to stored the token within the phone
export const TOKEN_KEY = "GaloyToken"

type JwtPayload = {
  uid: string
  network: INetwork
}

type TokenPayload = {
  uid: string
  network: INetwork
  token: string
}

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
  loadToken: () => Promise<Record<string, string>>
  removeToken: () => Promise<void>
  getToken: () => string | null
  getTokenUid: () => string | null
  getTokenNetwork: () => INetwork | null
  hasToken: () => boolean
}

const useToken = (): UseTokenReturn => {
  const memToken = React.useRef<null | TokenPayload>(null)

  return React.useMemo(
    () => ({
      saveToken: async (token: string): Promise<boolean> => {
        const { uid, network } = decodeToken(token)
        memToken.current = { token, uid, network }
        return saveString(TOKEN_KEY, token)
      },
      loadToken: async (): Promise<Record<string, string>> => {
        // TODO: replace with secure storage
        const token = await loadString(TOKEN_KEY)
        const { uid, network } = decodeToken(token)
        memToken.current = { token, uid, network }
        analytics().setUserId(uid)
        return memToken.current
      },
      removeToken: async (): Promise<void> => {
        memToken.current = null
        removeString(TOKEN_KEY)
      },
      getToken: (): string | null => {
        return memToken.current?.token
        // TODO check
      },
      getTokenUid: (): string | null => {
        return memToken.current?.uid
        // TODO check
      },
      getTokenNetwork: (): INetwork | null => {
        return memToken.current?.network
        // TODO check
      },
      hasToken: (): boolean => {
        return memToken.current !== null
        // TODO check
      },
    }),
    [],
  )
}

export default useToken
