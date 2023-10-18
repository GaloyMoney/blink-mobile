// Welcome to the main entry point of the app.
//
// In this file, we'll be kicking off our app

// language related import
import "intl-pluralrules"

import "react-native-reanimated"

import "@react-native-firebase/crashlytics"
import { ThemeProvider } from "@rneui/themed"
import "node-libs-react-native/globals" // needed for Buffer?
import * as React from "react"
import ErrorBoundary from "react-native-error-boundary"
import { RootSiblingParent } from "react-native-root-siblings"
import { GaloyToast } from "./components/galoy-toast"
import { NotificationComponent } from "./components/notification"
import { GaloyClient } from "./graphql/client"
import TypesafeI18n from "./i18n/i18n-react"
import { loadAllLocales } from "./i18n/i18n-util.sync"
import { AppStateWrapper } from "./navigation/app-state"
import { NavigationContainerWrapper } from "./navigation/navigation-container-wrapper"
import { RootStack } from "./navigation/root-navigator"
import theme from "./rne-theme/theme"
import { ErrorScreen } from "./screens/error-screen"
import { PersistentStateProvider } from "./store/persistent-state"
import { detectDefaultLocale } from "./utils/locale-detector"
import { ThemeSyncGraphql } from "./utils/theme-sync"
import { NetworkErrorComponent } from "./graphql/network-error-component"
import { FeatureFlagContextProvider } from "./config/feature-flags-context"
import "./utils/logs"

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
  <PersistentStateProvider>
    <TypesafeI18n locale={detectDefaultLocale()}>
      <ThemeProvider theme={theme}>
        <GaloyClient>
          <FeatureFlagContextProvider>
            <ErrorBoundary FallbackComponent={ErrorScreen}>
              <NavigationContainerWrapper>
                <RootSiblingParent>
                  <AppStateWrapper />
                  <NotificationComponent />
                  <RootStack />
                  <GaloyToast />
                  <NetworkErrorComponent />
                </RootSiblingParent>
              </NavigationContainerWrapper>
            </ErrorBoundary>
            <ThemeSyncGraphql />
          </FeatureFlagContextProvider>
        </GaloyClient>
      </ThemeProvider>
    </TypesafeI18n>
  </PersistentStateProvider>
)
