<<<<<<< HEAD
import AsyncStorage from "@react-native-async-storage/async-storage"
import RNSecureKeyStore from "react-native-secure-key-store"
=======
import AsyncStorage from '@react-native-async-storage/async-storage'
>>>>>>> Wrap SecureKeyStore and Biometric utility functions
import { BUILD_VERSION } from "../app"
import { NETWORK_STRING } from "./network"
import { Token, TOKEN_KEY } from "./token"
import KeyStoreWrapper from './storage/secureStorage'

export const resetDataStore = async (client) => {
  try {
    await client.clearStore()
    await new Token().remove()
    // await AsyncStorage.clear()
    await AsyncStorage.multiRemove([NETWORK_STRING, TOKEN_KEY, BUILD_VERSION]) // use storage.ts wrapper
<<<<<<< HEAD
    await RNSecureKeyStore.remove("isBiometricsEnabled")
    await RNSecureKeyStore.remove("PIN")
    await RNSecureKeyStore.remove("pinAttempts")
  } catch (err) {
    console.log({ err }, "error resetting RootStore")
=======
    await KeyStoreWrapper.removeIsBiometricsEnabled()
    await KeyStoreWrapper.removePin()
    await KeyStoreWrapper.removePinAttempts()
  } catch(err) {
    console.log({err}, `error resetting RootStore`)
>>>>>>> Wrap SecureKeyStore and Biometric utility functions
  }
}
