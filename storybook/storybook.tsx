import React from "react"
import { getStorybookUI, configure } from "@storybook/react-native"
import SplashScreen from "react-native-splash-screen"

declare var module

import './rn-addons'
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"

configure(() => {
  require("./storybook-registry")
}, module)

const StorybookUI = getStorybookUI({
  port: 9001,
  host: "localhost",
  onDeviceUI: true,
  asyncStorage: require('@react-native-community/async-storage').default
})

const Stack = createStackNavigator();

// RN hot module must be in a class for HMR
export class StorybookUIRoot extends React.Component {

  componentDidMount() {
    SplashScreen.hide()
    if (typeof __TEST__ === "undefined" || !__TEST__) {
      const Reactotron = require("../app/services/reactotron")
      const reactotron = new Reactotron.Reactotron()
      reactotron.setup()
    }
  }
  render() {
    return  <NavigationContainer>
              <Stack.Navigator>
                <Stack.Screen name="Home" component={StorybookUI} />
              </Stack.Navigator>
            </NavigationContainer>
    }
}
