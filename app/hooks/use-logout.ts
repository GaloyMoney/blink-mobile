import AsyncStorage from "@react-native-async-storage/async-storage"
import { BUILD_VERSION } from "@app/config"
import KeyStoreWrapper from "../utils/storage/secureStorage"
import useToken from "./use-token"
import crashlytics from "@react-native-firebase/crashlytics"
import { logLogout } from "@app/utils/analytics"
import { useCallback } from "react"
import { useApolloClient } from "@apollo/client"

const useLogout = () => {
  const client = useApolloClient()
  const { clearToken } = useToken()

  const logout = useCallback(
    async (shouldClearToken = true): Promise<void> => {
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
      } catch (err: unknown) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          console.debug({ err }, `error logout`)
        }
      }
    },
    [clearToken, client],
  )

  return {
    logout,
  }
}

export default useLogout
