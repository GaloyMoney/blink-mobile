import AsyncStorage from "@react-native-community/async-storage"
import { ROOT_STATE_STORAGE_KEY } from "../models"
import { NETWORK_STRING } from "./network"
import { Token } from "./token"

export const resetDataStore = async () => {
  try {
    await AsyncStorage.multiRemove([ROOT_STATE_STORAGE_KEY, NETWORK_STRING]) // use storage.ts wrapper
    const token = new Token()
    await token.delete()
    // TOKEN_KEY is stored at a separate location
  } catch(e) {
    console.tron.log(`error resetting RootStore: ${e}`)
  }
}
