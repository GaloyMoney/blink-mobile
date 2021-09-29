import AsyncStorage from "@react-native-async-storage/async-storage"
import { BUILD_VERSION } from "../app"
import { NETWORK_STRING } from "./network"
import { TOKEN_KEY } from "./use-token"
import KeyStoreWrapper from "./storage/secureStorage"
import { ApolloClient } from "@apollo/client"

type ResetDataStoreInput = {
  client: ApolloClient<unknown>
  removeToken: () => Promise<void>
}

export const resetDataStore = async ({
  client,
  removeToken,
}: ResetDataStoreInput): Promise<void> => {
  try {
    await client.clearStore()
    removeToken()
    // await AsyncStorage.clear()
    await AsyncStorage.multiRemove([NETWORK_STRING, TOKEN_KEY, BUILD_VERSION]) // use storage.ts wrapper
    await KeyStoreWrapper.removeIsBiometricsEnabled()
    await KeyStoreWrapper.removePin()
    await KeyStoreWrapper.removePinAttempts()
  } catch (err) {
    console.log({ err }, `error resetting RootStore`)
  }
}
