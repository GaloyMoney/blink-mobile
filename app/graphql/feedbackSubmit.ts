import { gql } from "@apollo/client"

gql`
  mutation feedbackSubmit($input: FeedbackSubmitInput!) {
    feedbackSubmit(input: $input) {
      errors {
        message
        __typename
      }
      success
      __typename
    }
  }
`
