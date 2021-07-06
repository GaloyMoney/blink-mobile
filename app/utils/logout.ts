import AsyncStorage from "@react-native-async-storage/async-storage"
import { BUILD_VERSION } from "../app"
import { NETWORK_STRING } from "./network"
import { Token, TOKEN_KEY } from "./token"
import KeyStoreWrapper from "./storage/secureStorage"

export const resetDataStore = async (client) => {
  try {
    await client.clearStore()
    await new Token().remove()
    // await AsyncStorage.clear()
    await AsyncStorage.multiRemove([NETWORK_STRING, TOKEN_KEY, BUILD_VERSION]) // use storage.ts wrapper
    await KeyStoreWrapper.removeIsBiometricsEnabled()
    await KeyStoreWrapper.removePin()
    await KeyStoreWrapper.removePinAttempts()
  } catch (err) {
    console.log({ err }, `error resetting RootStore`)
  }
}
