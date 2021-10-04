import { withKnobs } from "@storybook/addon-knobs"
import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import {StoryScreen,} from "../../../storybook/views"
import { UsernameScreen } from "./username-screen"
import {reactNavigationDecorator} from "../../../storybook/storybook-navigator";
import {MockedProvider} from "@apollo/client/testing";
import {USERNAME_EXIST} from "./../../graphql/query";

declare let module
    const mocks = [
  {
    request: {
      query: USERNAME_EXIST,
    },

  },
]
storiesOf("Set username", module)
  .addDecorator(withKnobs)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
    .addDecorator(reactNavigationDecorator)
    .add("Default", () => (
        <MockedProvider mocks={mocks}>
            <UsernameScreen />
        </MockedProvider>))
