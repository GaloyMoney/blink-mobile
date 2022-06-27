import { loadJson, saveJson } from "@app/utils/storage"
import { createContext } from "react"

export type AppConfiguration = {
  isUsdDisabled: boolean
}

export type AppConfigurationContext = {
  appConfig: AppConfiguration
  setAppConfig: (config: AppConfiguration) => void
}

export const defaultConfiguration: AppConfiguration = {
  isUsdDisabled: false,
}

export const AppConfigurationContext = createContext<AppConfigurationContext | undefined>(
  undefined,
)

export const loadAppConfig = async (): Promise<AppConfiguration> => {
  const data = await loadJson(APP_CONFIGURATION_KEY)
  const config = defaultConfiguration
  if (data) {
    for (const key in data) {
      if ({}.hasOwnProperty.call(data, key)) {
        config[key] = data[key]
      }
    }
  }

  return config
}

export const saveAppConfig = async (config: AppConfiguration) => {
  return saveJson(APP_CONFIGURATION_KEY, config)
}

export const APP_CONFIGURATION_KEY = "appConfig"
