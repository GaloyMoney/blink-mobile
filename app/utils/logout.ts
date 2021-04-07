import AsyncStorage from '@react-native-async-storage/async-storage'
import { NETWORK_STRING } from "./network"
import { Token, TOKEN_KEY } from "./token"

export const resetDataStore = async (client) => {
  try {
    await client.clearStore()
    await (new Token()).remove()
    // await AsyncStorage.clear()
    await AsyncStorage.multiRemove([NETWORK_STRING, TOKEN_KEY]) // use storage.ts wrapper
  } catch(err) {
    console.log({err}, `error resetting RootStore`)
  }
}
