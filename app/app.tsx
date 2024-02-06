// Welcome to the main entry point of the app.
//
// In this file, we'll be kicking off our app

// language related import
import "intl-pluralrules"
import "./i18n/mapping"

// for URL; need a polyfill on react native
import "react-native-url-polyfill/auto"

import "react-native-reanimated"

import "@react-native-firebase/crashlytics"
import "node-libs-react-native/globals" // needed for Buffer?
import * as React from "react"
import ErrorBoundary from "react-native-error-boundary"
import { RootSiblingParent } from "react-native-root-siblings"
import { GaloyToast } from "./components/galoy-toast"
import { PushNotificationComponent } from "./components/push-notification"
import { GaloyClient } from "./graphql/client"
import TypesafeI18n from "./i18n/i18n-react"
import { loadAllLocales } from "./i18n/i18n-util.sync"
import { AppStateWrapper } from "./navigation/app-state"
import { NavigationContainerWrapper } from "./navigation/navigation-container-wrapper"
import { RootStack } from "./navigation/root-navigator"
import { ErrorScreen } from "./screens/error-screen"
import { PersistentStateProvider } from "./store/persistent-state"
import { detectDefaultLocale } from "./utils/locale-detector"
import { NetworkErrorComponent } from "./graphql/network-error-component"
import { FeatureFlagContextProvider } from "./config/feature-flags-context"
import "./utils/logs"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { NotificationsProvider } from "./components/notifications/index"
import { GaloyThemeProvider } from "./components/galoy-theme-provider"

// FIXME should we only load the currently used local?
// this would help to make the app load faster
// this will become more important when we add more languages
// and when the earn section will be added
//
// alternatively, could try loadAllLocalesAsync()
loadAllLocales()

/**
 * This is the root component of our app.
 */
export const App = () => (
  /* eslint-disable-next-line react-native/no-inline-styles */
  <GestureHandlerRootView style={{ flex: 1 }}>
    <PersistentStateProvider>
      <TypesafeI18n locale={detectDefaultLocale()}>
        <GaloyClient>
          <GaloyThemeProvider>
            <FeatureFlagContextProvider>
              <ErrorBoundary FallbackComponent={ErrorScreen}>
                <NavigationContainerWrapper>
                  <RootSiblingParent>
                    <NotificationsProvider>
                      <AppStateWrapper />
                      <PushNotificationComponent />
                      <RootStack />
                      <NetworkErrorComponent />
                    </NotificationsProvider>
                    <GaloyToast />
                  </RootSiblingParent>
                </NavigationContainerWrapper>
              </ErrorBoundary>
            </FeatureFlagContextProvider>
          </GaloyThemeProvider>
        </GaloyClient>
      </TypesafeI18n>
    </PersistentStateProvider>
  </GestureHandlerRootView>
)
