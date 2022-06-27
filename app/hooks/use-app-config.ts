import {
  AppConfiguration,
  AppConfigurationContext,
  saveAppConfig,
} from "@app/context/app-configuration"
import { useContext } from "react"

export const useAppConfig = () => {
  const { appConfig, setAppConfig } = useContext(AppConfigurationContext)

  const setAndSaveConfig = (config: AppConfiguration) => {
    setAppConfig(config)
    saveAppConfig(config)
  }

  const toggleUsdDisabled = () =>
    setAndSaveConfig({ ...appConfig, isUsdDisabled: !appConfig.isUsdDisabled })

  return { appConfig, toggleUsdDisabled, setAppConfig }
}
