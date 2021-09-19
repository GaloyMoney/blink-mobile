import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import { ModalClipboard } from "./modal-clipboard"
import {reactNavigationDecorator} from "../../../storybook/storybook-navigator";

declare let module

storiesOf("Modal window", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .addDecorator(reactNavigationDecorator)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <ModalClipboard invoice="" />
      </UseCase>
    </Story>
  ))
