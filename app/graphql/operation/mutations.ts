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

  mutation userUpdateUsername($input: UserUpdateUsernameInput!) {
    userUpdateUsername(input: $input) {
      errors {
        __typename
        message
      }
      user {
        __typename
        id
        username
      }
    }
  }

  mutation accountUpdateDefaultWalletId($input: AccountUpdateDefaultWalletIdInput!) {
    accountUpdateDefaultWalletId(input: $input) {
      errors {
        __typename
        message
      }
      account {
        __typename
        id
        defaultWalletId
      }
    }
  }

  mutation captchaRequestAuthCode($input: CaptchaRequestAuthCodeInput!) {
    captchaRequestAuthCode(input: $input) {
      errors {
        __typename
        message
      }
      success
    }
  }

  mutation lnNoAmountInvoiceFeeProbe($input: LnNoAmountInvoiceFeeProbeInput!) {
    lnNoAmountInvoiceFeeProbe(input: $input) {
      errors {
        __typename
        message
      }
      amount
    }
  }

  mutation lnInvoiceFeeProbe($input: LnInvoiceFeeProbeInput!) {
    lnInvoiceFeeProbe(input: $input) {
      errors {
        __typename
        message
      }
      amount
    }
  }

  mutation lnUsdInvoiceFeeProbe($input: LnUsdInvoiceFeeProbeInput!) {
    lnUsdInvoiceFeeProbe(input: $input) {
      errors {
        __typename
        message
      }
      amount
    }
  }

  mutation lnNoAmountUsdInvoiceFeeProbe($input: LnNoAmountUsdInvoiceFeeProbeInput!) {
    lnNoAmountUsdInvoiceFeeProbe(input: $input) {
      errors {
        __typename
        message
      }
      amount
    }
  }

  mutation userUpdateUsername($input: UserUpdateUsernameInput!) {
    userUpdateUsername(input: $input) {
      errors {
        __typename
        message
      }
      user {
        __typename
        id
        username
      }
    }
  }

  mutation userUpdateLanguage($input: UserUpdateLanguageInput!) {
    userUpdateLanguage(input: $input) {
      errors {
        __typename
        message
      }
      user {
        __typename
        id
        language
      }
    }
  }

  mutation userLogin($input: UserLoginInput!) {
    userLogin(input: $input) {
      errors {
        __typename
        message
      }
      authToken
    }
  }
`
