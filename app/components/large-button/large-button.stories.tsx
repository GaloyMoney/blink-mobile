import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import { LargeButton } from "./large-button"
import { IconTransaction } from "../icon-transactions"
import { WalletType } from "../../utils/enum"

declare let module

storiesOf("Large Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <LargeButton
          icon={
            <IconTransaction
              isReceive={false}
              walletType={WalletType.BTC}
              pending={false}
              onChain={false}
            />
          }
          title="Open cash account"
        />
      </UseCase>
    </Story>
  ))
