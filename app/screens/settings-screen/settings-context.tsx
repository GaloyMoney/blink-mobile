import { PropsWithChildren, createContext, useContext } from "react"

import { SettingsScreenQuery, useSettingsScreenQuery } from "@app/graphql/generated"
import { ApolloQueryResult } from "@apollo/client"

type SettingsContextType = {
  data: SettingsScreenQuery | undefined
  loading: boolean
  refetch: () => Promise<ApolloQueryResult<SettingsScreenQuery>> | void
}

const SettingsContext = createContext<SettingsContextType>({
  data: undefined,
  loading: true,
  refetch: () => {},
})

export const SettingsContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const all = useSettingsScreenQuery()
  return <SettingsContext.Provider value={all}>{children}</SettingsContext.Provider>
}

export const useSettingsContext = () => useContext(SettingsContext)
