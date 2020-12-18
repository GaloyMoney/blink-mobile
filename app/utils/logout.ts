import AsyncStorage from '@react-native-async-storage/async-storage'

export const resetDataStore = async () => {
  try {
    await AsyncStorage.clear()
    // await AsyncStorage.multiRemove([ROOT_STATE_STORAGE_KEY, NETWORK_STRING, TOKEN_KEY]) // use storage.ts wrapper
  } catch(err) {
    console.tron.log({err}, `error resetting RootStore`)
  }
}
