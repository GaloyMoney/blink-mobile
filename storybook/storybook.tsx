import React from "react"
import { getStorybookUI, configure } from "@storybook/react-native"

import "./rn-addons"
import { NavigationContainer } from "@react-navigation/native"
import { ThemeProvider } from "@rneui/themed"
import { createStackNavigator } from "@react-navigation/stack"
import theme from "@app/rne-theme/theme"

configure(() => {
  require("./storybook-registry")
}, module)

const StorybookUI = getStorybookUI({
  port: 9001,
  host: "localhost",
  onDeviceUI: true,
  asyncStorage: require("@react-native-async-storage/async-storage").default,
})

const Stack = createStackNavigator()

export const StorybookUIRoot: React.FC = () => (
  <ThemeProvider theme={theme}>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={StorybookUI} />
      </Stack.Navigator>
    </NavigationContainer>
  </ThemeProvider>
)
