import { useApolloClient } from "@apollo/client"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { BUILD_VERSION } from "../app"
import KeyStoreWrapper from "../utils/storage/secureStorage"
import useToken from "./use-token"
import crashlytics from "@react-native-firebase/crashlytics"
import { logLogout } from "@app/utils/analytics"

const useLogout = () => {
  const client = useApolloClient()
  const { clearToken } = useToken()

  const logout = async (shouldClearToken = true): Promise<void> => {
    try {
      await Promise.all([
        client.clearStore(),
        AsyncStorage.multiRemove([BUILD_VERSION]),
        KeyStoreWrapper.removeIsBiometricsEnabled(),
        KeyStoreWrapper.removePin(),
        KeyStoreWrapper.removePinAttempts(),
      ])

      logLogout()

      if (shouldClearToken) {
        clearToken()
      }
    } catch (err) {
      crashlytics().recordError(err)
      console.debug({ err }, `error resetting RootStore`)
    }
  }

  return {
    logout,
  }
}

export default useLogout
