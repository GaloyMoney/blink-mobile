import React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen } from "../../../storybook/views"
import { BalanceHeader } from "./balance-header"
import { reactNavigationDecorator } from "../../../storybook/storybook-navigator"
import { withKnobs, select, number } from "@storybook/addon-knobs"

storiesOf("BalanceHeader", module)
  .addDecorator(withKnobs)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .addDecorator(reactNavigationDecorator)
  .addDecorator(withKnobs)
  .add("Balance Header - Dynamic", () => (
    <BalanceHeader
      currency={select("currency", ["USD", "BTC"], "USD")}
      amount={number("amount", NaN)}
    />
  ))
