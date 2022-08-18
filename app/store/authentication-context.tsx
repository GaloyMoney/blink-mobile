import { createContext, useContext, useMemo, useState } from "react"
import * as React from "react"

export type AutheticationContextType = {
  isAppLocked: boolean
  setAppUnlocked: () => void
  setAppLocked: () => void
}

export const AuthenticationContext = createContext<AutheticationContextType>(null)

export const AuthenticationContextProvider = ({ children }) => {
  const [isAppLocked, setIsAppLocked] = useState(true)
  const setAppUnlocked = useMemo(() => () => setIsAppLocked(false), [])
  const setAppLocked = useMemo(() => () => setIsAppLocked(true), [])
  return (
    <AuthenticationContext.Provider value={{ isAppLocked, setAppUnlocked, setAppLocked }}>
      {children}
    </AuthenticationContext.Provider>
  )
}

export const useAuthenticationContext = () => useContext(AuthenticationContext)
