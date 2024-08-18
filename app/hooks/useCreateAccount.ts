import { v4 as uuidv4 } from "uuid"
import * as Keychain from "react-native-keychain"
import analytics from "@react-native-firebase/analytics"
import crashlytics from "@react-native-firebase/crashlytics"
import { generateSecureRandom } from "react-native-securerandom"

// utils
import {
  logAttemptCreateDeviceAccount,
  logCreateDeviceAccountFailure,
  logCreatedDeviceAccount,
} from "@app/utils/analytics"

// hooks
import { useAppConfig } from "./use-app-config"
import useAppCheckToken from "@app/screens/get-started-screen/use-device-token"
import { useFeatureFlags } from "@app/config/feature-flags-context"

const DEVICE_ACCOUNT_CREDENTIALS_KEY = "device-account"

export const useCreateAccount = () => {
  const { deviceAccountEnabled } = useFeatureFlags()
  const [appCheckToken, loading] = useAppCheckToken({ skip: !deviceAccountEnabled })
  const {
    appConfig: {
      galoyInstance: { authUrl },
    },
  } = useAppConfig()

  const createDeviceAccountAndLogin = async () => {
    try {
      const credentials = await Keychain.getInternetCredentials(
        DEVICE_ACCOUNT_CREDENTIALS_KEY,
      )

      let username: string
      let password: string

      if (credentials) {
        username = credentials.username
        password = credentials.password
      } else {
        username = await generateSecureRandomUUID()
        password = await generateSecureRandomUUID()
        const setPasswordResult = await Keychain.setInternetCredentials(
          DEVICE_ACCOUNT_CREDENTIALS_KEY,
          username,
          password,
        )
        if (!setPasswordResult) {
          throw new Error("Error setting device account credentials")
        }
      }

      logAttemptCreateDeviceAccount()

      const auth = Buffer.from(`${username}:${password}`, "utf8").toString("base64")

      const res = await fetch(authUrl + "/auth/create/device-account", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          Appcheck: `${appCheckToken}` || "undefined",
        },
      })
      if (!res.ok) {
        console.error(`Error fetching from server: ${res.status} ${res.statusText}`)
        return // Or handle this error appropriately
      }

      const data: {
        result: string | undefined
      } = await res.json()
      // alert("SUCCESS")
      const authToken = data.result

      if (!authToken) {
        throw new Error("Error getting session token")
      }

      logCreatedDeviceAccount()
      analytics().logLogin({ method: "device" })
      return authToken
    } catch (error) {
      logCreateDeviceAccountFailure()
      if (error instanceof Error) {
        crashlytics().recordError(error)
      }
      return false
    }
  }

  const generateSecureRandomUUID = async () => {
    const randomBytes = await generateSecureRandom(16) // Generate 16 random bytes
    const uuid = uuidv4({ random: randomBytes }) // Use the random seed to generate a UUID
    return uuid
  }

  return {
    createDeviceAccountAndLogin,
    appcheckTokenLoading: loading,
  }
}
