import { MockedProvider } from "@apollo/client/testing"
import React, { PropsWithChildren } from "react"
import { StoryScreen } from "../../.storybook/views"
import { createCache } from "../../app/graphql/cache"
import { IsAuthedContextProvider } from "../../app/graphql/is-authed-context"

import theme from "@app/rne-theme/theme"
import { NavigationContainer } from "@react-navigation/native"
import { ThemeProvider } from "@rneui/themed"

import mocks from "@app/graphql/mocks"
import { createStackNavigator } from "@react-navigation/stack"
import TypesafeI18n from "@app/i18n/i18n-react"
import { detectDefaultLocale } from "@app/utils/locale-detector"

const Stack = createStackNavigator()

export const ContextForScreen: React.FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home">
          {() => (
            <MockedProvider mocks={mocks} cache={createCache()}>
              <StoryScreen>
                <TypesafeI18n locale={detectDefaultLocale()}>
                  <IsAuthedContextProvider value={true}>
                    {children}
                  </IsAuthedContextProvider>
                </TypesafeI18n>
              </StoryScreen>
            </MockedProvider>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  </ThemeProvider>
)
