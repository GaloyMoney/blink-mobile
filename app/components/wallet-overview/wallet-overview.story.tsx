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
        <WalletOverview
          usdBalance={100.0}
          btcPrimaryBalance={100.0}
          btcSecondaryBalance={356542}
          transferButtonAction={() => {
            return
          }}
        />
      </UseCase>
    </Story>
  ))
