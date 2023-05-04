import React, { useState, createContext, useContext, useEffect } from "react"
import remoteConfigInstance from "@react-native-firebase/remote-config"
import { useAppConfig } from "@app/hooks"

const DeviceAccountEnabledKey = "deviceAccountEnabled"

type FeatureFlags = {
  deviceAccountEnabled: boolean
}

type RemoteConfig = FeatureFlags

const defaultRemoteConfig = {
  deviceAccountEnabled: false,
}

const defaultFeatureFlags = {
  deviceAccountEnabled: false,
}

remoteConfigInstance().setDefaults(defaultRemoteConfig)

remoteConfigInstance().setConfigSettings({
  minimumFetchIntervalMillis: 0,
})

export const FeatureFlagContext = createContext<FeatureFlags>(defaultFeatureFlags)

export const FeatureFlagContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [remoteConfig, setRemoteConfig] = useState<RemoteConfig>(defaultRemoteConfig)

  const {
    appConfig: { galoyInstance },
  } = useAppConfig()

  useEffect(() => {
    const fetchAndActivate = async () => {
      try {
        await remoteConfigInstance().fetchAndActivate()
        const deviceAccountEnabled = remoteConfigInstance()
          .getValue(DeviceAccountEnabledKey)
          .asBoolean()
        setRemoteConfig({ deviceAccountEnabled })
      } catch (e) {
        console.error("error fetching remote config")
      }
    }

    fetchAndActivate()
  }, [])

  const featureFlags = {
    deviceAccountEnabled:
      remoteConfig.deviceAccountEnabled || galoyInstance.id === "Local",
  }

  return (
    <FeatureFlagContext.Provider value={featureFlags}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

export const useFeatureFlags = () => useContext(FeatureFlagContext)
