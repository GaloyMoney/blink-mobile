import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { BalanceHeader } from "./"
import { CurrencyType } from "../../utils/enum"

declare let module

storiesOf("BalanceHeader", module)
  .addDecorator(fn => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <BalanceHeader currency={CurrencyType.USD} amount={100} />
      </UseCase>
      <UseCase text="Sat" usage="The secondary.">
        <BalanceHeader currency={CurrencyType.BTC} amount={10000} />
      </UseCase>
      <UseCase text="Sat with dollar" usage="Bitcoin Account">
        <BalanceHeader currency={CurrencyType.BTC} amount={10000} />
      </UseCase>
    </Story>
  ))
