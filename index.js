// This is the first file that ReactNative will run when it starts up.
//
// We jump out of here immediately and into our main entry point instead.
//
// It is possible to have React Native load our main module first, but we'd have to
// change that in both AppDelegate.m and MainApplication.java.  This would have the
// side effect of breaking other tooling like mobile-center and react-native-rename.
//
// It's easier just to leave it here.
import "react-native-get-random-values"
import { TextEncoder, TextDecoder } from "@sinonjs/text-encoding"
import { AppRegistry, LogBox, TextInput, Text } from "react-native"
import { App } from "./app/app.tsx"
import * as React from "react"

// Override Text scaling
if (Text.defaultProps) {
  Text.defaultProps.allowFontScaling = false
} else {
  Text.defaultProps = {}
  Text.defaultProps.allowFontScaling = false
}

// Override Text scaling in input fields
if (TextInput.defaultProps) {
  TextInput.defaultProps.allowFontScaling = false
} else {
  TextInput.defaultProps = {}
  TextInput.defaultProps.allowFontScaling = false
}

class MessageChannel {
  constructor() {
    this.port1 = new MessagePort()
    this.port2 = new MessagePort()
    this.port1.setOtherPort(this.port2)
    this.port2.setOtherPort(this.port1)
  }
}

class MessagePort {
  constructor() {
    this.otherPort = null
    this.listeners = new Map()
  }

  setOtherPort(otherPort) {
    this.otherPort = otherPort
  }

  addEventListener(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(listener)
  }

  removeEventListener(event, listener) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index !== -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  postMessage(data) {
    this.otherPort.dispatchEvent("message", { data })
  }

  start() {
    // No-op in React Native
  }

  dispatchEvent(event, data) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data))
    }
  }
}

global.MessageChannel = MessageChannel

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder
}

if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder
}

const ignoreLogs = [
  /Non-serializable values were found in the navigation state. Check:\s*sendBitcoinDetails/, // SendBitcoin navigation values are not serializable to prevent boiler plate serialization and deserialization across the flow.
]
LogBox.ignoreLogs(ignoreLogs)

/**
 * This needs to match what's found in your app_delegate.m and MainActivity.java.
 */
const APP_NAME = "LNFlash"

// Should we show storybook instead of our app?
//
// ⚠️ Leave this as `false` when checking into git.
const SHOW_STORYBOOK = false

let RootComponent = () => <App />

if (__DEV__ && SHOW_STORYBOOK) {
  // Only include Storybook if we're in dev mode
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { StorybookUIRoot } = require("./.storybook/index.ts")
  RootComponent = StorybookUIRoot
}

AppRegistry.registerComponent(APP_NAME, () => RootComponent)
