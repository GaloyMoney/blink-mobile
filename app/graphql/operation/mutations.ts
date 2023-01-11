import { gql } from "@apollo/client"
export default gql`
  mutation captchaCreateChallenge {
    captchaCreateChallenge {
      errors {
        __typename
        message
      }
      result {
        __typename
        id
        challengeCode
        newCaptcha
        failbackMode
      }
    }
  }

  mutation userContactUpdateAlias($input: UserContactUpdateAliasInput!) {
    userContactUpdateAlias(input: $input) {
      errors {
        __typename
        message
      }
    }
  }

  mutation deviceNotificationTokenCreate($input: DeviceNotificationTokenCreateInput!) {
    deviceNotificationTokenCreate(input: $input) {
      errors {
        __typename
        message
      }
      success
    }
  }

  mutation intraLedgerPaymentSend($input: IntraLedgerPaymentSendInput!) {
    intraLedgerPaymentSend(input: $input) {
      errors {
        __typename
        message
      }
      status
    }
  }

  mutation intraLedgerUsdPaymentSend($input: IntraLedgerUsdPaymentSendInput!) {
    intraLedgerUsdPaymentSend(input: $input) {
      errors {
        __typename
        message
      }
      status
    }
  }

  mutation userQuizQuestionUpdateCompleted(
    $input: UserQuizQuestionUpdateCompletedInput!
  ) {
    userQuizQuestionUpdateCompleted(input: $input) {
      errors {
        __typename
        message
      }
      userQuizQuestion {
        question {
          id
          earnAmount
        }
        completed
      }
    }
  }
`
