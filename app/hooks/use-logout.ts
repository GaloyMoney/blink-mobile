import AsyncStorage from "@react-native-async-storage/async-storage"
import { SCHEMA_VERSION_KEY } from "@app/config"
import KeyStoreWrapper from "../utils/storage/secureStorage"
import crashlytics from "@react-native-firebase/crashlytics"
import { logLogout } from "@app/utils/analytics"
import { useCallback } from "react"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { gql } from "@apollo/client"
import { useUserLogoutMutation } from "@app/graphql/generated"
import messaging from "@react-native-firebase/messaging"

gql`
  mutation userLogout($input: UserLogoutInput!) {
    userLogout(input: $input) {
      success
    }
  }
`

const useLogout = () => {
  const { resetState } = usePersistentStateContext()
  const [userLogoutMutation] = useUserLogoutMutation({
    fetchPolicy: "no-cache",
  })

  const logout = useCallback(
    async (stateToDefault = true): Promise<void> => {
      try {
        const deviceToken = await messaging().getToken()

        await AsyncStorage.multiRemove([SCHEMA_VERSION_KEY])
        await KeyStoreWrapper.removeIsBiometricsEnabled()
        await KeyStoreWrapper.removePin()
        await KeyStoreWrapper.removePinAttempts()

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
    [resetState, userLogoutMutation],
  )

  return {
    logout,
  }
}

export default useLogout
