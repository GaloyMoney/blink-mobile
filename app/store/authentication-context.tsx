import { createContext, useContext } from "react"

export type AuthenticationContextType = {
  isAppLocked: boolean
  setAppUnlocked: () => void
  setAppLocked: () => void
}

export const AuthenticationContext = createContext<AuthenticationContextType>(null)

export const useAuthenticationContext = () => useContext(AuthenticationContext)
