import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { withKnobs } from "@storybook/addon-knobs"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import { WelcomePhoneValidationScreen, WelcomePhoneInputScreen } from "./phone-auth"

declare let module

const route = {
  params: { confirmation: {} },
}

storiesOf("Phone number auth", module)
  .addDecorator(withKnobs)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <WelcomePhoneInputScreen />
      </UseCase>
      <UseCase text="Dollar" usage="The primary.">
        <WelcomePhoneValidationScreen
          route={route}
          onSuccess={() => null}
          navigation={{ navigate: () => null }}
        />
      </UseCase>
    </Story>
  ))
