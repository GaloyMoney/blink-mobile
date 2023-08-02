import React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { StoryScreen } from "../../../.storybook/views"
import {
  CaptchaCreateChallengeDocument,
  CaptchaRequestAuthCodeDocument,
  UserEmailRegistrationInitiateDocument,
} from "../../graphql/generated"
import { EmailLoginInitiateScreen } from "./email-login-initiate"

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
  {
    request: {
      query: UserEmailRegistrationInitiateDocument,
      variables: {
        input: {
          email: "info@galoy.io",
        },
      },
    },
    result: {
      data: {
        userEmailRegistrationInitiate: {
          flow: "0bba1f6d-fc58-49d3-ba54-fd023b1b79cc",
          errors: [],
          me: {
            id: "1",
            email: {
              address: "info@galoy.io",
              verified: false,
            },
          },
        },
      },
    },
  },
]

export default {
  title: "EmailLoginFlow",
  component: EmailLoginInitiateScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
}

export const Default = () => <EmailLoginInitiateScreen />
