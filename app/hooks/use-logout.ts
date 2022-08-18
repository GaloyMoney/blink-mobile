import { useApolloClient } from "@apollo/client"
import { useAuthenticationContext } from "@app/store/authentication-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { BUILD_VERSION } from "../app"
import { authTokenVar } from "../graphql/client-only-query"
import { NETWORK_STRING } from "../utils/network"
import KeyStoreWrapper from "../utils/storage/secureStorage"
import { TOKEN_KEY } from "./use-token"

const useLogout = () => {
  const client = useApolloClient()
  const { setAppLocked } = useAuthenticationContext()

  const logout = async (): Promise<void> => {
    try {
      await client.clearStore()
      authTokenVar(null)
      setAppLocked()
      await AsyncStorage.multiRemove([NETWORK_STRING, TOKEN_KEY, BUILD_VERSION]) // use storage.ts wrapper
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
