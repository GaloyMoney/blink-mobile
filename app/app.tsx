// Welcome to the main entry point of the app.
//
// In this file, we'll be kicking off our app or storybook.

import 'react-native-gesture-handler'

import "@react-native-firebase/crashlytics"

import "node-libs-react-native/globals" // needed for Buffer?

import "./i18n"
import * as React from "react"
import { useRef, useState, useEffect } from "react"
import { AppRegistry, YellowBox } from "react-native"
import { StorybookUIRoot } from "../storybook"
import { RootStore, setupRootStore } from "./models/root-store"
import { Provider } from "mobx-react"
import { BackButtonHandler } from "./navigation/back-button-handler"
import { contains } from "ramda"
import { DEFAULT_NAVIGATION_CONFIG } from "./navigation/navigation-config"
import { Notifications } from "react-native-notifications"
import { NavigationContainer } from '@react-navigation/native'
import analytics from '@react-native-firebase/analytics'
import { RootStack } from './navigation/root-navigator'
import { getActiveRouteName, getActiveRouteParams } from "./utils/navigation"

/**
 * Ignore some yellowbox warnings. Some of these are for deprecated functions
 * that we haven't gotten around to replacing yet.
 */
YellowBox.ignoreWarnings([
  "componentWillMount is deprecated",
  "componentWillReceiveProps is deprecated",
])

// FIXME
console.disableYellowBox = true


interface AppState {
  rootStore?: RootStore
}

export const APP_EDUCATION = false
  
/**
 * This is the root component of our app.
 */
export const App = () => {  
  const [rootStore, setRootStore] = useState(null)

  const routeNameRef = useRef();
  const navigationRef = useRef();

  useEffect(() => {
    // FIXME there might be a better way to manage this notification
    Notifications.events().registerNotificationReceivedBackground((notification, completion) => {
      console.tron.log("Background")
      console.tron.log({notification})
      completion({ alert: true, sound: false, badge: false })
    })
    
    Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
      console.tron.log("Foregound")
      console.tron.log({notification})

      if (getActiveRouteName(routeNameRef) !== "receiveBitcoin") {
        // if (invoice.paymentRequest === self.lastAddInvoice) {
        completion({ alert: true, sound: false, badge: false })
      }
    })
  }, [])

  useEffect(() => {
    // this is necessary for hot reloading?
    if (rootStore != null) {
      return
    } 

    const fn = async () => {
      setRootStore(await setupRootStore())
    }
    fn()
  }, [])

  React.useEffect(() => {
    if (rootStore != null || navigationRef.current == undefined) {
      return
    }

    console.tron.log({navigationRef})

    // this is only accessible after this has been assigned, which is when we have 
    const state = navigationRef.current.getRootState();

    // Save the initial route name
    routeNameRef.current = getActiveRouteName(state);
  }, [rootStore]);


  /**
   * Are we allowed to exit the app?  This is called when the back button
   * is pressed on android.
   *
   * @param routeName The currently active route name.
   */
  const canExit = (routeName: string) => {
    return contains(routeName, DEFAULT_NAVIGATION_CONFIG.exitRoutes)
  }

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  //
  // This step should be completely covered over by the splash screen though.
  //
  // You're welcome to swap in your own component to render if your boot up
  // sequence is too slow though.
  if (!rootStore) {
    return null
  }

  const { ...otherStores } = rootStore

  return (
    // TODO replace with React.createContext
    // https://mobx.js.org/refguide/inject.html
    <Provider rootStore={rootStore} {...otherStores} routeNameRef={routeNameRef}>
      {/* <BackButtonHandler canExit={canExit}> */}
        <NavigationContainer
          ref={navigationRef}
          onStateChange={state => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName = getActiveRouteName(state);
    
            if (previousRouteName !== currentRouteName) {
              if (currentRouteName == "rewardsDetail") {
                const routeAndSection = `${currentRouteName}_${getActiveRouteParams(state).section}`
                console.tron.log({routeAndSection})
                analytics().setCurrentScreen(routeAndSection, currentRouteName);
              } else {
                analytics().setCurrentScreen(currentRouteName, currentRouteName);
              }
            }
    
            // Save the current route name for later comparision
            routeNameRef.current = currentRouteName;
          }}>
          {/* <StatefulNavigator> */}
            <RootStack />
          {/* <StatefulNavigator /> */}
        </NavigationContainer>
      {/* </BackButtonHandler> */}
    </Provider>
  )
}

/**
 * This needs to match what's found in your app_delegate.m and MainActivity.java.
 */
const APP_NAME = "GaloyApp"

// Should we show storybook instead of our app?
//
// ⚠️ Leave this as `false` when checking into git.
const SHOW_STORYBOOK = false

const RootComponent = SHOW_STORYBOOK && __DEV__ ? StorybookUIRoot : App
AppRegistry.registerComponent(APP_NAME, () => RootComponent)
