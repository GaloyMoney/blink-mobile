import { ServerError } from "@apollo/client"
import { createContext, useContext } from "react"

const NetworkError = createContext<ServerError | undefined>(undefined)

export const NetworkErrorContextProvider = NetworkError.Provider

export const useNetworkError = () => useContext(NetworkError)
