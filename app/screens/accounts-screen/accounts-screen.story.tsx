import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import { AccountType } from "../../utils/enum"
import { AccountItem } from "./accounts-screen"

declare let module

storiesOf("AccountItem", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Initial loading">
        <AccountItem account={AccountType.Bank} icon={"ios-cash"} />
      </UseCase>
      <UseCase text="After loading">
        <AccountItem
          account={AccountType.Bank}
          icon={"ios-cash"}
          amount={1234}
        />
      </UseCase>
      <UseCase text="Open bank account">
        <AccountItem
          account={AccountType.Bank}
          icon={"ios-cash"}
          amount={1234}
          title={"Open bank account"}
        />
      </UseCase>
    </Story>
  ))
