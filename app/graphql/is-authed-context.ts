import { createContext, useContext } from "react"

const IsAuthed = createContext<boolean>(false)

export const IsAuthedContextProvider = IsAuthed.Provider

export const useIsAuthed = () => useContext(IsAuthed)
