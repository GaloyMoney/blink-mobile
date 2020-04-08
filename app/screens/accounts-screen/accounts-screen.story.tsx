import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { AccountType } from "../../utils/enum"
import { AccountItem } from "./accounts-screen"

declare let module

storiesOf("AccountItem", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Initial loading" usage="Cash">
        <AccountItem account={AccountType.Bank} icon={"ios-cash"} initialLoading={true} />
      </UseCase>
      <UseCase text="After loading" usage="Cash">
        <AccountItem
          account={AccountType.Bank}
          icon={"ios-cash"}
          initialLoading={false}
          balance={1234}
        />
      </UseCase>
    </Story>
  ))
