import * as React from "react"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { ConversionSuccessScreen } from "./conversion-success-screen"
import { DarkModeDocument } from "../../graphql/generated"

const mocks = [
  {
    request: {
      query: DarkModeDocument,
    },
    result: {
      data: {
        // FIXME: doesn't work for some reasons
        darkMode: true,
      },
    },
  },
]

export default {
  title: "Conversion Success Screen",
  component: ConversionSuccessScreen,
  decorators: [
    (Story) => (
      <PersistentStateWrapper>
        <StoryScreen>{Story()}</StoryScreen>
      </PersistentStateWrapper>
    ),
  ],
} as ComponentMeta<typeof ConversionSuccessScreen>

export const Default = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <ConversionSuccessScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
