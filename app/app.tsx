// Welcome to the main entry point of the app.
//
// In this file, we'll be kicking off our app

// language related import
import "intl-pluralrules"
import "./utils/polyfill"
import "moment/locale/es"
import "moment/locale/fr-ca"
import "moment/locale/pt-br"

import "react-native-reanimated"

import "@react-native-firebase/crashlytics"
import "node-libs-react-native/globals" // needed for Buffer?
import * as React from "react"
import { Dimensions } from "react-native"
import ErrorBoundary from "react-native-error-boundary"
import EStyleSheet from "react-native-extended-stylesheet"
import { RootSiblingParent } from "react-native-root-siblings"
import { GlobalErrorToast } from "./components/global-error"
import { RootStack } from "./navigation/root-navigator"
import { ErrorScreen } from "./screens/error-screen"
import { ThemeProvider } from "@rneui/themed"
import { GaloyToast } from "./components/galoy-toast"
import { GaloyClient } from "./graphql/client"
import TypesafeI18n from "./i18n/i18n-react"
import { loadAllLocales } from "./i18n/i18n-util.sync"
import { NavigationContainerWrapper } from "./navigation/navigation-container-wrapper"
import theme from "./rne-theme/theme"
import { PersistentStateProvider } from "./store/persistent-state"
import { detectDefaultLocale } from "./utils/locale-detector"
import { AppStateWrapper } from "./navigation/app-state"

const entireScreenWidth = Dimensions.get("window").width
EStyleSheet.build({
  $rem: entireScreenWidth / 380,
  // $textColor: '#0275d8'
})

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
    <ThemeProvider theme={theme}>
      <TypesafeI18n locale={detectDefaultLocale()}>
        <GaloyClient>
          <ErrorBoundary FallbackComponent={ErrorScreen}>
            <NavigationContainerWrapper>
              <RootSiblingParent>
                <AppStateWrapper>
                  <GlobalErrorToast />
                  <RootStack />
                  <GaloyToast />
                </AppStateWrapper>
              </RootSiblingParent>
            </NavigationContainerWrapper>
          </ErrorBoundary>
        </GaloyClient>
      </TypesafeI18n>
    </ThemeProvider>
  </PersistentStateProvider>
)
