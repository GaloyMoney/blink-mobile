import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import WalletOverview from "./wallet-overview"

declare let module

storiesOf("Wallet Overview", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="USD" usage="The default.">
        <WalletOverview navigation={undefined} />
      </UseCase>
    </Story>
  ))
