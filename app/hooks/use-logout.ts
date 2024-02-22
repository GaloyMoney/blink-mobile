import AsyncStorage from "@react-native-async-storage/async-storage"
import { BACKUP_COMPLETED, SCHEMA_VERSION_KEY } from "@app/config"
import KeyStoreWrapper from "../utils/storage/secureStorage"
import crashlytics from "@react-native-firebase/crashlytics"
import { logLogout } from "@app/utils/analytics"
import { useCallback } from "react"
import { usePersistentStateContext } from "@app/store/persistent-state"
import * as Keychain from "react-native-keychain"
import { disconnectToSDK } from "@app/utils/breez-sdk"
import { useAppDispatch } from "@app/store/redux"
import { resetUserSlice } from "@app/store/redux/slices/userSlice"

const KEYCHAIN_MNEMONIC_KEY = "mnemonic_key"

const useLogout = () => {
  const { resetState } = usePersistentStateContext()
  const dispatch = useAppDispatch()

  const logout = useCallback(
    async (stateToDefault = true): Promise<void> => {
      try {
        await AsyncStorage.multiRemove([SCHEMA_VERSION_KEY, BACKUP_COMPLETED])
        await KeyStoreWrapper.removeIsBiometricsEnabled()
        await KeyStoreWrapper.removePin()
        await KeyStoreWrapper.removePinAttempts()
        await Keychain.resetInternetCredentials(KEYCHAIN_MNEMONIC_KEY)
        await disconnectToSDK()
        dispatch(resetUserSlice())

        logLogout()
        if (stateToDefault) {
          resetState()
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          console.debug({ err }, `error logout`)
        }
      }
    },
    [resetState],
  )

  return {
    logout,
  }
}

export default useLogout
