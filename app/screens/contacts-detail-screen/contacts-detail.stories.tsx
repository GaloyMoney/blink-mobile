import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen } from "../../../storybook/views"
import { ContactsDetailScreenJSX } from "./contacts-detail"
import {reactNavigationDecorator} from "../../../storybook/storybook-navigator";
import {transactions} from "../../screens/transaction-screen/transaction-screen.stories";

const contact = {
  id: "MikeP",
  name: "Mike Peterson",
}


storiesOf("Contact Detail", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
    .addDecorator(reactNavigationDecorator)
  .add("Contact with transactions", () => (
        <ContactsDetailScreenJSX
          contact={contact}
          transactions={transactions}
          navigation={{navigate: () => null }}
        />
  ))
.add("Contact no transactions", () => (
        <ContactsDetailScreenJSX
          contact={contact}
          transactions={[]}
          navigation={{navigate: () => null }}
        />
  ))
