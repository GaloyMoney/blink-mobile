import React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import mocks from "../../graphql/mocks"
import SendBitcoinConfirmationScreen from "./send-bitcoin-confirmation-screen"
import { RouteProp } from "@react-navigation/native"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

export default {
  title: "SendBitcoinConfirmationScreen",
  component: SendBitcoinConfirmationScreen,
  decorators: [
    (Story) => (
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <StoryScreen>{Story()}</StoryScreen>
        </MockedProvider>
      </IsAuthedContextProvider>
    ),
  ],
} as Meta<typeof SendBitcoinConfirmationScreen>

export const Intraledger = ({
  route,
}: {
  route: RouteProp<RootStackParamList, "sendBitcoinConfirmation">
}) => <SendBitcoinConfirmationScreen route={route} />

export const LightningLnURL = ({
  route,
}: {
  route: RouteProp<RootStackParamList, "sendBitcoinConfirmation">
}) => <SendBitcoinConfirmationScreen route={route} />
