import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { ContactsScreenJSX } from "./contacts"

const list = [
  {
    id: "MikeP",
    avatar_url: "https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg",
    title: "Mike - the guy that started it all",
  },
  {
    id: "nicolas",
    avatar_url: "https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg",
    title: "Nicolas",
  },
  // ... // more items
]

storiesOf("Phone Book", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <ContactsScreenJSX list={list} navigation={() => {}} />
      </UseCase>
    </Story>
  ))
