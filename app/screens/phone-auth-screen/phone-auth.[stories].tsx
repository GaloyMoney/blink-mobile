import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { withKnobs } from "@storybook/addon-knobs"
import { StoryScreen } from "../../../storybook/views"
import { WelcomePhoneInputScreen, WelcomePhoneValidationScreen } from "./phone-auth"
import { reactNavigationDecorator } from "../../../storybook/storybook-navigator"

declare let module

storiesOf("Phone number auth", module)
  .addDecorator(withKnobs)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .addDecorator(reactNavigationDecorator)
  .add("Input Screen", () => <WelcomePhoneInputScreen />)
  .add("Validation screen", () => (
    <WelcomePhoneValidationScreen
      onSuccess={() => null}
      navigation={{ navigate: () => null }}
    />
  ))
