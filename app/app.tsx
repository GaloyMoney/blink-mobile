// Welcome to the main entry point of the app.
//
// In this file, we'll be kicking off our app or storybook.
import "intl-pluralrules"
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
import "./utils/polyfill"
// import moment locale files so we can display dates in the user's language
import { ThemeProvider } from "@rneui/themed"
import "moment/locale/es"
import "moment/locale/fr-ca"
import "moment/locale/pt-br"
import { GaloyToast } from "./components/galoy-toast"
import { GaloyClient } from "./graphql/client"
import TypesafeI18n from "./i18n/i18n-react"
import { loadAllLocales } from "./i18n/i18n-util.sync"
import { NavigationContainerWrapper } from "./navigation/navigation-container-wrapper"
import theme from "./rne-theme/theme"
import { PersistentStateProvider } from "./store/persistent-state"
import { customLocaleDetector } from "./utils/locale-detector"

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
  return (
    <PersistentStateProvider>
      <ThemeProvider theme={theme}>
        <TypesafeI18n locale={customLocaleDetector()}>
          <GaloyClient>
            <ErrorBoundary FallbackComponent={ErrorScreen}>
              <NavigationContainerWrapper>
                <RootSiblingParent>
                  <GlobalErrorToast />
                  <RootStack />
                  <GaloyToast />
                </RootSiblingParent>
              </NavigationContainerWrapper>
            </ErrorBoundary>
          </GaloyClient>
        </TypesafeI18n>
      </ThemeProvider>
    </PersistentStateProvider>
  )
}
