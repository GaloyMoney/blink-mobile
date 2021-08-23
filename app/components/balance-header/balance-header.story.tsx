import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { BalanceHeader } from "."

declare let module

storiesOf("BalanceHeader", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="Loading">
        <BalanceHeader currency={"USD"} amount={NaN} />
      </UseCase>
      <UseCase text="Dollar" usage="0 (to separate with null)">
        <BalanceHeader currency={"USD"} amount={0} />
      </UseCase>
      <UseCase text="Dollar" usage="The primary.">
        <BalanceHeader currency={"USD"} amount={100} />
      </UseCase>
      <UseCase text="Sat" usage="The secondary.">
        <BalanceHeader currency={"BTC"} amount={10000} />
      </UseCase>
      <UseCase text="Sat with dollar" usage="Bitcoin Account">
        <BalanceHeader currency={"BTC"} amount={10000} />
      </UseCase>
      <UseCase text="Sat with dollar" usage="Bitcoin Account">
        <BalanceHeader currency={"BTC"} amount={10000} amountOtherCurrency={10} />
      </UseCase>
    </Story>
  ))
