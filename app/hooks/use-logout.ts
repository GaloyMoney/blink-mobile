import AsyncStorage from "@react-native-async-storage/async-storage"
import crashlytics from "@react-native-firebase/crashlytics"
import messaging from "@react-native-firebase/messaging"

// utils
import KeyStoreWrapper from "../utils/storage/secureStorage"
import { logLogout } from "@app/utils/analytics"

// store
import { resetUserSlice } from "@app/store/redux/slices/userSlice"

// hooks
import { useApolloClient } from "@apollo/client"
import { useCallback } from "react"
import { useUserLogoutMutation } from "@app/graphql/generated"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { useAppDispatch } from "@app/store/redux"

import { BACKUP_COMPLETED, SCHEMA_VERSION_KEY } from "@app/config"

const useLogout = () => {
  const client = useApolloClient()

  const dispatch = useAppDispatch()
  const { resetState } = usePersistentStateContext()

  const [userLogoutMutation] = useUserLogoutMutation({
    fetchPolicy: "no-cache",
  })

  const logout = useCallback(
    async (stateToDefault = true): Promise<void> => {
      try {
        const deviceToken = await messaging().getToken()

        await client.cache.reset()
        await AsyncStorage.multiRemove([SCHEMA_VERSION_KEY, BACKUP_COMPLETED])
        await KeyStoreWrapper.removeIsBiometricsEnabled()
        await KeyStoreWrapper.removePin()
        await KeyStoreWrapper.removePinAttempts()
        dispatch(resetUserSlice())

        logLogout()
        if (stateToDefault) {
          resetState()
        }

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
      }
    },
    [resetState, client],
  )

  return {
    logout,
  }
}

export default useLogout
