// Welcome to the main entry point of the app.
//
// In this file, we'll be kicking off our app or storybook.
import "intl-pluralrules"
import "react-native-reanimated"

import analytics from "@react-native-firebase/analytics"
import "@react-native-firebase/crashlytics"
import {
  LinkingOptions,
  NavigationContainer,
  NavigationState,
  PartialState,
} from "@react-navigation/native"
import "node-libs-react-native/globals" // needed for Buffer?
import * as React from "react"
import { useMemo, useRef, useState } from "react"
import { Dimensions, Linking } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { RootSiblingParent } from "react-native-root-siblings"
import { GlobalErrorToast } from "./components/global-error"
import "./utils/polyfill"
import { RootStack } from "./navigation/root-navigator"
import ErrorBoundary from "react-native-error-boundary"
import { ErrorScreen } from "./screens/error-screen"
// import moment locale files so we can display dates in the user's language
import "moment/locale/es"
import "moment/locale/fr-ca"
import "moment/locale/pt-br"
import { AuthenticationContext } from "./store/authentication-context"
import { LocalizationContextProvider } from "./store/localization-context"
import { loadAllLocales } from "./i18n/i18n-util.sync"
import TypesafeI18n from "./i18n/i18n-react"
import { customLocaleDetector } from "./utils/locale-detector"
import { ThemeProvider } from "@rneui/themed"
import theme from "./rne-theme/theme"
import { GaloyToast } from "./components/galoy-toast"
import { RootStackParamList } from "./navigation/stack-param-lists"
import useToken from "./hooks/use-token"
import { GaloyClient } from "./graphql/client"

const entireScreenWidth = Dimensions.get("window").width
EStyleSheet.build({
  $rem: entireScreenWidth / 380,
  // $textColor: '#0275d8'
})

loadAllLocales()

/**
 * This is the root component of our app.
 */
export const App = () => {
  const { hasToken } = useToken()
  const routeName = useRef("Initial")
  const [isAppLocked, setIsAppLocked] = useState(true)
  const processLink = useRef<((url: string) => void) | null>(null)
  processLink.current = () => {
    return undefined
  }
  const setAppUnlocked = useMemo(
    () => () => {
      setIsAppLocked(false)
      Linking.getInitialURL().then((url) => {
        if (url && hasToken && processLink.current) {
          processLink.current(url)
        }
      })
    },
    [hasToken],
  )

  const setAppLocked = useMemo(() => () => setIsAppLocked(true), [])
  const getActiveRouteName = (
    state: NavigationState | PartialState<NavigationState> | undefined,
  ): string => {
    if (!state || typeof state.index !== "number") {
      return "Unknown"
    }

    const route = state.routes[state.index]

    if (route.state) {
      return getActiveRouteName(route.state)
    }

    return route.name
  }

  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [
      "https://ln.bitcoinbeach.com",
      "bitcoinbeach://",
      "https://pay.mainnet.galoy.io",
      "https://pay.bbw.sv",
    ],
    config: {
      screens: {
        sendBitcoinDestination: ":username",
        Primary: {
          screens: {
            moveMoney: "/",
          },
        },
      },
    },
    getInitialURL: async () => {
      const url = await Linking.getInitialURL()
      if (Boolean(url) && hasToken && !isAppLocked) {
        return url
      }
      return null
    },
    subscribe: (listener) => {
      const onReceiveURL = ({ url }: { url: string }) => listener(url)
      // Listen to incoming links from deep linking
      const subscription = Linking.addEventListener("url", onReceiveURL)
      processLink.current = listener

      return () => {
        // Clean up the event listeners
        subscription.remove()
        processLink.current = null
      }
    },
  }

  return (
    <AuthenticationContext.Provider value={{ isAppLocked, setAppUnlocked, setAppLocked }}>
      <ThemeProvider theme={theme}>
        <TypesafeI18n locale={customLocaleDetector()}>
          <GaloyClient>
            <ErrorBoundary FallbackComponent={ErrorScreen}>
              <LocalizationContextProvider>
                <NavigationContainer
                  linking={linking}
                  onStateChange={(state) => {
                    const currentRouteName = getActiveRouteName(state)

                    if (routeName.current !== currentRouteName && currentRouteName) {
                      /* eslint-disable camelcase */
                      analytics().logScreenView({
                        screen_name: currentRouteName,
                        screen_class: currentRouteName,
                        is_manual_log: true,
                      })
                      routeName.current = currentRouteName
                    }
                  }}
                >
                  <RootSiblingParent>
                    <GlobalErrorToast />
                    <RootStack />
                    <GaloyToast />
                  </RootSiblingParent>
                </NavigationContainer>
              </LocalizationContextProvider>
            </ErrorBoundary>
          </GaloyClient>
        </TypesafeI18n>
      </ThemeProvider>
    </AuthenticationContext.Provider>
  )
}
