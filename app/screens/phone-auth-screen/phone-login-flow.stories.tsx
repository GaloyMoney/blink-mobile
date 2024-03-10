import React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import {
  CaptchaCreateChallengeDocument,
  CaptchaRequestAuthCodeDocument,
} from "../../graphql/generated"
import { PhoneLoginNavigator } from "../../navigation/root-navigator"

const mocks = [
  {
    request: { query: CaptchaCreateChallengeDocument },
    result: {
      data: {
        captchaCreateChallenge: {
          errors: [],
          result: {
            id: "d5cdc22925d10bc4720d012ba48dd214",
            challengeCode: "af073125d936ff9e5aa4c1ed44a38d5d",
            newCaptcha: true,
            failbackMode: false,
            __typename: "CaptchaCreateChallengeResult",
          },
          __typename: "CaptchaCreateChallengePayload",
        },
      },
    },
  },
  {
    request: {
      query: CaptchaRequestAuthCodeDocument,
      variables: {
        input: {
          phone: "+50365055543",
          challengeCode: "af073125d936ff9e5aa4c1ed44a38d5d4s",
          validationCode: "290cc148dfb39afb5af63320469facd6|jordan",
          secCode: "290cc148dfb39afb5af63320469facd6",
          channel: "SMS",
        },
      },
    },
    result: {
      data: {
        captchaRequestAuthCode: {
          success: true,
          errors: [],
        },
      },
    },
  },
]

export default {
  title: "PhoneFlow",
  component: PhoneLoginNavigator,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof PhoneLoginNavigator>

export const Default = () => <PhoneLoginNavigator />
