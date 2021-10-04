import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen } from "../../../storybook/views"
import { ModalClipboard } from "./modal-clipboard"
import {reactNavigationDecorator} from "../../../storybook/storybook-navigator";
import Clipboard from "@react-native-community/clipboard"


declare let module

const defaultParams = {
  message: "test string",
  setMessage: () => Clipboard.setString("test string")
}

storiesOf("Modal window", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .addDecorator(reactNavigationDecorator)
  .add("Default", () => (
          <ModalClipboard invoice="text" {...defaultParams }/> // TODO - invoice for testing
  ))
