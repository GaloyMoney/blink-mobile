import { PREFIX_LINKING } from "@app/config"
import analytics from "@react-native-firebase/analytics"
import {
  LinkingOptions,
  NavigationContainer,
  NavigationState,
  PartialState,
  DarkTheme,
} from "@react-navigation/native"
import * as React from "react"
import { useRef } from "react"
import { Linking } from "react-native"
import { useIsAuthed } from "../graphql/is-authed-context"
import { RootStackParamList } from "./stack-param-lists"
import { useTheme } from "@rneui/themed"

import RNBootSplash from "react-native-bootsplash"

export type AuthenticationContextType = {
  isAppLocked: boolean
  setAppUnlocked: () => void
  setAppLocked: () => void
}

// The initial value will never be null because the provider will always pass a non null value
// eslint-disable-next-line
// @ts-ignore
const AuthenticationContext = React.createContext<AuthenticationContextType>(null)

export const AuthenticationContextProvider = AuthenticationContext.Provider

export const useAuthenticationContext = () => React.useContext(AuthenticationContext)

export const NavigationContainerWrapper: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const isAuthed = useIsAuthed()

  const processLink = useRef<((url: string) => void) | null>(null)
  processLink.current = () => {
    return undefined
  }

  const setAppUnlocked = React.useMemo(
    () => async () => {
      setIsAppLocked(false)
      const url = await Linking.getInitialURL()

      if (url && isAuthed && processLink.current) {
        processLink.current(url)
      }
    },
    [isAuthed],
  )

  const setAppLocked = React.useMemo(() => () => setIsAppLocked(true), [])

  const [isAppLocked, setIsAppLocked] = React.useState(true)

  const routeName = useRef("Initial")

  const {
    theme: { mode },
  } = useTheme()

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
    prefixes: [...PREFIX_LINKING, "bitcoin://", "lightning://", "lapp://"],
    config: {
      screens: {
        sendBitcoinDestination: ":payment",
        Primary: {
          screens: {
            Home: "/",
          },
        },
      },
    },
    getInitialURL: async () => {
      const url = await Linking.getInitialURL()
      if (Boolean(url) && isAuthed && !isAppLocked) {
        return url
      }
      return null
    },
    subscribe: (listener) => {
      console.log("listener", listener)
      const onReceiveURL = ({ url }: { url: string }) => {
        console.log("onReceiveURL", url)
        listener(url)
      }
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
    <AuthenticationContextProvider value={{ isAppLocked, setAppUnlocked, setAppLocked }}>
      <NavigationContainer
        {...(mode === "dark" ? { theme: DarkTheme } : {})}
        linking={linking}
        onReady={() => {
          RNBootSplash.hide({ fade: true, duration: 220 })
          console.log("NavigationContainer onReady")
        }}
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
        {children}
      </NavigationContainer>
    </AuthenticationContextProvider>
  )
}
