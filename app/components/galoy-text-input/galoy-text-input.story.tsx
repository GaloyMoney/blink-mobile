import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import { GaloyTextInput } from "./galoy-text-input"
import { KeyboardAvoidingView } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

storiesOf("Galoy text input", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Set Username", () => (
    <Story>
      <UseCase text="Set Username" usage="with appended string">
        <GaloyTextInput
          label="Set your BBW address"
          onChangeText={(value) => console.log(value)}
          append="@bbw.sv"
        />
      </UseCase>
      <UseCase text="Set Username" usage="with prepended string">
        <GaloyTextInput
          label="Set your BBW address"
          onChangeText={(value) => console.log(value)}
          prepend="@"
        />
      </UseCase>
      <UseCase text="Set Username" usage="without prepend or appended string">
        <GaloyTextInput
          placeholder="BBW Address"
          label="Set your BBW address"
          onChangeText={(value) => console.log(value)}
        />
      </UseCase>
      <UseCase text="Set Username" usage="with override for label styles">
        <GaloyTextInput
          placeholder="test"
          label="Set your BBW address"
          labelStyle={{ paddingBottom: 18 }}
          onChangeText={(value) => console.log(value)}
          prepend="£"
        />
      </UseCase>
    </Story>
  ))
