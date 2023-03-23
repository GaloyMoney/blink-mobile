import AsyncStorage from "@react-native-async-storage/async-storage"
import { BUILD_VERSION } from "@app/config"
import KeyStoreWrapper from "../utils/storage/secureStorage"
import crashlytics from "@react-native-firebase/crashlytics"
import { logLogout } from "@app/utils/analytics"
import { useCallback } from "react"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { ACCESS_TOKEN } from "@app/modules/market-place/config/constant"

const useLogout = () => {
  const { resetState } = usePersistentStateContext()

  const logout = useCallback(
    async (stateToDefault = true): Promise<void> => {
      try {
        await AsyncStorage.multiRemove([BUILD_VERSION])
        await AsyncStorage.removeItem(ACCESS_TOKEN)
        await KeyStoreWrapper.removeIsBiometricsEnabled()
        await KeyStoreWrapper.removePin()
        await KeyStoreWrapper.removePinAttempts()

        logLogout()
        if (stateToDefault) {
          resetState()
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          console.debug({ err }, `error logout`)
        }
      }
    },
    [resetState],
  )

  return {
    logout,
  }
}

export default useLogout
