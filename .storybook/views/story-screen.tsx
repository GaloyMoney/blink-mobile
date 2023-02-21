import * as React from "react"
import TypesafeI18n from "@app/i18n/i18n-react"
import { detectDefaultLocale } from "../../app/utils/locale-detector"
import { PersistentStateContext } from "../../app/store/persistent-state"

export const PersistentStateWrapper = ({ children }) => (
  <PersistentStateContext.Provider
    value={{
      persistentState: {
        schemaVersion: 4,
        hasShownStableSatsWelcome: true,
        isUsdDisabled: false,
        galoyInstance: {
          name: "BBW",
          graphqlUri: "",
          graphqlWsUri: "",
          posUrl: "",
          lnAddressHostname: "",
        },
        galoyAuthToken: "",
        isAnalyticsEnabled: true,
      },
      updateState: () => {},
      resetState: () => {},
    }}
  >
    <>{children}</>
  </PersistentStateContext.Provider>
)


export const StoryScreen: React.FC<React.PropsWithChildren> = ({ children }) => 
  <TypesafeI18n locale={detectDefaultLocale()}>{children}</TypesafeI18n>
  
