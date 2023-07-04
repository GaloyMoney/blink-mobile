import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { SuggestionModal } from "./suggestion-modal"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "../../navigation/stack-param-lists"

export default {
  title: "SuggestionModal",
  component: SuggestionModal,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof SuggestionModal>

const navigationMock: StackNavigationProp<RootStackParamList> = {
  popToTop: () => {},
} as StackNavigationProp<RootStackParamList>

const params = {
  navigation: navigationMock,
  showSuggestionModal: true,
  setShowSuggestionModal: () => {},
} as const

export const Default = () => (
  <MockedProvider mocks={[]} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <SuggestionModal {...params} />
    </IsAuthedContextProvider>
  </MockedProvider>
)
