import { useState, useEffect } from "react"
import appCheck from "@react-native-firebase/app-check"

const debugTokenAndroid = `6AED0F8B-51EE-41BD-B6C7-0D34D78E94BC`

const rnfbProvider = appCheck().newReactNativeFirebaseAppCheckProvider()
rnfbProvider.configure({
  android: {
    provider: __DEV__ ? "debug" : "playIntegrity",
    debugToken: debugTokenAndroid,
  },
  apple: {
    provider: "appAttestWithDeviceCheckFallback",
  },
  web: {
    provider: "reCaptchaV3",
    siteKey: "unknown",
  },
})

appCheck().initializeAppCheck({ provider: rnfbProvider, isTokenAutoRefreshEnabled: true })

export const getDeviceToken = async (): Promise<string | undefined> => {
  try {
    const result = await appCheck().getToken()
    const token = result.token
    return token
  } catch (err) {
    return undefined
  }
}

const useDeviceToken = ({
  skip = false,
}: {
  skip: boolean
}): [string | undefined, boolean] => {
  const [token, setToken] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (skip) {
      return
    }

    const tryGetDeviceToken = async (): Promise<void> => {
      setLoading(true)
      const result = await getDeviceToken()
      setToken(result)
      setLoading(false)
    }

    tryGetDeviceToken()
  }, [skip])

  return [token, loading]
}

export default useDeviceToken
