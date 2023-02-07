import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { boolean, withKnobs } from "@storybook/addon-knobs"
import { action } from "@storybook/addon-actions"
import { Story, StoryScreen } from "../../../storybook/views"
import { HomeScreen } from "./home-screen"

declare let module

storiesOf("Home Screen", module)
  .addDecorator(withKnobs)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <HomeScreen
        bankOnboarded={boolean("bankOnboarded", false)}
        navigation={{ navigate: action("navigate") }}
        walletActivated={boolean("walletActivated", false)}
        amount={12345}
        transactions={[
          {
            __typename: "Transaction",
            id: "5fc019f245c81e001d60cc6d",
            amount: -100,
            description: "onchain_on_us",
            fee: 0,
            createdAt: 1606425074,
            hash: null,
            usd: 0.017197999999999998,
            pending: false,
            type: "onchain_on_us",
            feeUsd: 0,
          },
          {
            __typename: "Transaction",
            id: "5fbda166bc19d0001c8f3e24",
            amount: -4759,
            description: "on_us",
            fee: 0,
            createdAt: 1606263142,
            hash: "d45676b17080e9721f7d2a149defb6b597c291642515879d579e00552acce022",
            usd: 0.91057062774408,
            pending: false,
            type: "on_us",
            feeUsd: 0,
          },
          {
            __typename: "Transaction",
            id: "5fbd7a84bc19d0001c8f3e18",
            amount: -103,
            description: "payment",
            fee: 3,
            createdAt: 1606253188,
            hash: "953f8c9b8600648399c3b76801b3bb74cb5976eb9c67c8896e5beb6f3ccf0612",
            usd: 0.01960708,
            pending: false,
            type: "payment",
            feeUsd: 0.00057108,
          },
        ]}
      />
    </Story>
  ))
