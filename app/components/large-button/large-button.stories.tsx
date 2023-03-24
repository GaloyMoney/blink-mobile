import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../.storybook/views"
import { LargeButton } from "./large-button"
import { IconTransaction } from "../icon-transactions"
import { WalletCurrency } from "@app/graphql/generated"
import { createCache } from "../../graphql/cache"
import { MockedProvider } from "@apollo/client/testing"

storiesOf("Large Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <MockedProvider mocks={[]} cache={createCache()}>
      <Story>
        <UseCase text="Dollar" usage="The primary.">
          <LargeButton
            icon={
              <IconTransaction
                isReceive={false}
                walletCurrency={WalletCurrency.BTC}
                pending={false}
                onChain={false}
              />
            }
            title="Open cash account"
          />
        </UseCase>
      </Story>
    </MockedProvider>
  ))
