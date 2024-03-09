import { useState, useEffect } from "react"
import Config from "react-native-config"

import appCheck from "@react-native-firebase/app-check"

const rnfbProvider = appCheck().newReactNativeFirebaseAppCheckProvider()
rnfbProvider.configure({
  android: {
    provider: __DEV__ ? "debug" : "playIntegrity",
    debugToken: Config.APP_CHECK_ANDROID_DEBUG_TOKEN,
  },
  apple: {
    provider: __DEV__ ? "debug" : "appAttestWithDeviceCheckFallback",
    debugToken: Config.APP_CHECK_IOS_DEBUG_TOKEN,
  },
})

appCheck().initializeAppCheck({ provider: rnfbProvider, isTokenAutoRefreshEnabled: true })

let isFetchingToken = false
const promisesToResolveOnToken: ((value: string | undefined) => void)[] = []

export const getAppCheckToken = async (): Promise<string | undefined> => {
  // If we're already fetching the token, wait for it to be fetched
  if (isFetchingToken) {
    return new Promise((resolve) => {
      promisesToResolveOnToken.push(resolve)
    })
  }

  isFetchingToken = true

  let token: string | undefined = undefined
  try {
    const result = await appCheck().getToken()
    token = result.token
  } catch (err) {
    console.log("getDeviceToken error", err)
  }

  // Resolve all promises that were waiting for the token
  while (promisesToResolveOnToken.length > 0) {
    const resolve = promisesToResolveOnToken.pop()
    resolve && resolve(token)
  }

  if (isFetchingToken) {
    isFetchingToken = false
  }

  return token
}

const useAppCheckToken = ({ skip = false }: { skip?: boolean }): string | undefined => {
  const [token, setToken] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (skip) return
    ;(async () => {
      const result = await getAppCheckToken()
      setToken(result)
    })()
  }, [skip])

  return token
}

export default useAppCheckToken
