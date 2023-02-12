import { createContext, useContext } from "react"

const LnUpdateHash = createContext<string>("")

export const LnUpdateHashProvider = LnUpdateHash.Provider

export const useLnUpdateHash = () => useContext(LnUpdateHash)
