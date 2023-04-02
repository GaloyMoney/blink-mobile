import * as React from "react"
import TypesafeI18n from "@app/i18n/i18n-react"
import { detectDefaultLocale } from "../../app/utils/locale-detector"
import { PersistentStateContext } from "../../app/store/persistent-state"

const PersistentStateWrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <PersistentStateContext.Provider
    value={{
      persistentState: {
        schemaVersion: 5,
        galoyInstance: {
          id: "Main",
        },
        galoyAuthToken: "",
      },
      updateState: () => {},
      resetState: () => {},
    }}
  >
    <>{children}</>
  </PersistentStateContext.Provider>
)

const I18nWrapper: React.FC<React.PropsWithChildren> = ({ children }) => 
  <TypesafeI18n locale={detectDefaultLocale()}>{children}</TypesafeI18n>


export const StoryScreen: React.FC<React.PropsWithChildren> = ({ children }) => 
<PersistentStateWrapper><I18nWrapper>{children}</I18nWrapper></PersistentStateWrapper>
  
