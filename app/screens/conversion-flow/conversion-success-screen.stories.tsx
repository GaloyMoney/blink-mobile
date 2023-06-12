import * as React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { Meta } from "@storybook/react"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { ConversionSuccessScreen } from "./conversion-success-screen"

export default {
  title: "Conversion Success Screen",
  component: ConversionSuccessScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof ConversionSuccessScreen>

export const Default = () => (
  <MockedProvider mocks={[]} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <ConversionSuccessScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
