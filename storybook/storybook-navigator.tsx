import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {ApolloClient, ApolloProvider, InMemoryCache} from "@apollo/client";
import {isIos} from "../app/utils/helper";


const StoryBookStack = createStackNavigator();

const client = new ApolloClient({
  name: isIos ? "iOS" : "Android",
  cache: new InMemoryCache(),
});

/**
 * Helper component tor create a Dummy Stack to access {navigation} object on *.story.tsx files
 *
 * @usage add this decorator
 * ```
 * .addDecorator(reactNavigationDecorator)
 * ```
 */
export const reactNavigationDecorator = (story) => {
  const Screen = () => story();
  return (
      <ApolloProvider client={client}>
        <NavigationContainer independent={true}>
          <StoryBookStack.Navigator>
            <StoryBookStack.Screen
              name="BitcoinBeachStoryScreen"
              component={Screen}
              options={{header: () => null}}
            />
          </StoryBookStack.Navigator>
        </NavigationContainer>
      </ApolloProvider>
  );
}