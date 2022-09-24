import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import { SetAddressModal } from "./"
import { Button, KeyboardAvoidingView } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

storiesOf("Address Screen", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Set Address Modal", () => (
    <Story>
      <UseCase text="Set Address" usage="Modal shows when user is adding their address">
        <SetAddressModal modalVisible={true} />
      </UseCase>
    </Story>
  ))
