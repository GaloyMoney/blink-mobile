import { useApolloClient } from "@apollo/client"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { BUILD_VERSION } from "../app"
import KeyStoreWrapper from "../utils/storage/secureStorage"
import useToken, { TOKEN_KEY } from "./use-token"

const useLogout = () => {
  const client = useApolloClient()
  const { clearToken } = useToken()

  const logout = async (): Promise<void> => {
    try {
      await client.clearStore()
      clearToken()
      await AsyncStorage.multiRemove([TOKEN_KEY, BUILD_VERSION]) // use storage.ts wrapper
      await KeyStoreWrapper.removeIsBiometricsEnabled()
      await KeyStoreWrapper.removePin()
      await KeyStoreWrapper.removePinAttempts()
    } catch (err) {
      console.debug({ err }, `error resetting RootStore`)
    }
  }

  return {
    logout,
  }
}

export default useLogout
