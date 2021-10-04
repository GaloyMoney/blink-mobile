import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { withKnobs } from "@storybook/addon-knobs"
import { StoryScreen } from "../../../storybook/views"
import { WelcomePhoneValidationScreen, WelcomePhoneInputScreen } from "./phone-auth"
import {reactNavigationDecorator} from "../../../storybook/storybook-navigator";

declare let module

const route = {
  params: { confirmation: {} },
}

storiesOf("Phone number auth", module)
  .addDecorator(withKnobs)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .addDecorator(reactNavigationDecorator)
  .add("Input Screen", () => (
       <WelcomePhoneInputScreen />
      ))
 /* .add("Validation screen", () => (
        <WelcomePhoneValidationScreen
          route={route}
          onSuccess={() => null}
          navigation={{ navigate: () => null }}
        />
   ))*/