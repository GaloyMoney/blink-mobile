import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { ContactsDetailScreenJSX } from "./contacts-detail"

const contact = {
  id: "MikeP",
  name: "Mike Peterson",
}

const transactions = []

storiesOf("Contact Detail", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Contact default", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <ContactsDetailScreenJSX
          contact={contact}
          transactions={transactions}
          navigation={() => null}
        />
      </UseCase>
    </Story>
  ))
