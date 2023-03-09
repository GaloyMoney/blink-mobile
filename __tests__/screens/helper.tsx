import { MockedProvider } from "@apollo/client/testing"
import React, { PropsWithChildren } from "react"
import { PersistentStateWrapper, StoryScreen } from "../../.storybook/views"
import { createCache } from "../../app/graphql/cache"
import { IsAuthedContextProvider } from "../../app/graphql/is-authed-context"

import theme from "@app/rne-theme/theme"
import { NavigationContainer } from "@react-navigation/native"
import { ThemeProvider } from "@rneui/themed"

import mocks from "@app/graphql/mocks"
import { createStackNavigator } from "@react-navigation/stack"

const Stack = createStackNavigator()

export const ContextForScreen: React.FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home">
          {() => (
            <MockedProvider mocks={mocks} cache={createCache()}>
              <StoryScreen>
                <IsAuthedContextProvider value={true}>
                  <PersistentStateWrapper>{children}</PersistentStateWrapper>
                </IsAuthedContextProvider>
              </StoryScreen>
            </MockedProvider>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  </ThemeProvider>
)
