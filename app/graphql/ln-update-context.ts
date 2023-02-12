import { createContext, useContext } from "react"

const LnUpdateHashPaid = createContext<string>("")

export const LnUpdateHashPaidProvider = LnUpdateHashPaid.Provider

export const useLnUpdateHashPaid = () => useContext(LnUpdateHashPaid)
