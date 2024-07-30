import AsyncStorage from "@react-native-async-storage/async-storage"
import { BACKUP_COMPLETED, SCHEMA_VERSION_KEY } from "@app/config"
import KeyStoreWrapper from "../utils/storage/secureStorage"
import crashlytics from "@react-native-firebase/crashlytics"
import { logLogout } from "@app/utils/analytics"
import { useCallback } from "react"
import { useUserLogoutMutation } from "@app/graphql/generated"
import { usePersistentStateContext } from "@app/store/persistent-state"
import * as Keychain from "react-native-keychain"
import { disconnectToSDK } from "@app/utils/breez-sdk"
import { useAppDispatch } from "@app/store/redux"
import { resetUserSlice } from "@app/store/redux/slices/userSlice"
import messaging from "@react-native-firebase/messaging"

const KEYCHAIN_MNEMONIC_KEY = "mnemonic_key"

const useLogout = () => {
  const dispatch = useAppDispatch()
  const { resetState } = usePersistentStateContext()
  const [userLogoutMutation] = useUserLogoutMutation({
    fetchPolicy: "no-cache",
  })

  const logout = useCallback(
    async (stateToDefault = true): Promise<void> => {
      try {
        const deviceToken = await messaging().getToken()

        await AsyncStorage.multiRemove([SCHEMA_VERSION_KEY, BACKUP_COMPLETED])
        await KeyStoreWrapper.removeIsBiometricsEnabled()
        await KeyStoreWrapper.removePin()
        await KeyStoreWrapper.removePinAttempts()
        await Keychain.resetInternetCredentials(KEYCHAIN_MNEMONIC_KEY)
        await disconnectToSDK()
        dispatch(resetUserSlice())

        logLogout()

        await Promise.race([
          userLogoutMutation({ variables: { input: { deviceToken } } }),
          // Create a promise that rejects after 2 seconds
          // this is handy for the case where the server is down, or in dev mode
          new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error("Logout mutation timeout"))
            }, 2000)
          }),
        ])
      } catch (err: unknown) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          console.debug({ err }, `error logout`)
        }
      } finally {
        if (stateToDefault) {
          resetState()
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
