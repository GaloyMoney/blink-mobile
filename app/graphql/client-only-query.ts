import { ApolloClient, gql } from "@apollo/client"
import {
  BetaDocument,
  BetaQuery,
  ColorSchemeDocument,
  ColorSchemeQuery,
  FeedbackModalShownDocument,
  FeedbackModalShownQuery,
  HasPromptedSetDefaultAccountDocument,
  HiddenBalanceToolTipDocument,
  HiddenBalanceToolTipQuery,
  HideBalanceDocument,
  HideBalanceQuery,
  InnerCircleValueDocument,
  InnerCircleValueQuery,
  IntroducingCirclesModalShownDocument,
  IntroducingCirclesModalShownQuery,
} from "./generated"

export default gql`
  query hideBalance {
    hideBalance @client
  }

  query hiddenBalanceToolTip {
    hiddenBalanceToolTip @client
  }

  query beta {
    beta @client
  }

  query colorScheme {
    colorScheme @client # "system" | "light" | "dark"
  }

  query feedbackModalShown {
    feedbackModalShown @client
  }

  query hasPromptedSetDefaultAccount {
    hasPromptedSetDefaultAccount @client
  }

  query introducingCirclesModalShown {
    introducingCirclesModalShown @client
  }

  query innerCircleValue {
    innerCircleValue @client
  }
`

export const saveHideBalance = (
  client: ApolloClient<unknown>,
  status: boolean,
): boolean => {
  try {
    client.writeQuery<HideBalanceQuery>({
      query: HideBalanceDocument,
      data: {
        __typename: "Query",
        hideBalance: status,
      },
    })
    return status
  } catch {
    return false
  }
}

export const saveHiddenBalanceToolTip = (
  client: ApolloClient<unknown>,
  status: boolean,
): boolean => {
  try {
    client.writeQuery<HiddenBalanceToolTipQuery>({
      query: HiddenBalanceToolTipDocument,
      data: {
        __typename: "Query",
        hiddenBalanceToolTip: status,
      },
    })
    return status
  } catch {
    return false
  }
}

export const activateBeta = (client: ApolloClient<unknown>, status: boolean) => {
  try {
    client.writeQuery<BetaQuery>({
      query: BetaDocument,
      data: {
        __typename: "Query",
        beta: status,
      },
    })
  } catch {
    console.warn("impossible to update beta")
  }
}

export const updateColorScheme = (client: ApolloClient<unknown>, colorScheme: string) => {
  try {
    client.writeQuery<ColorSchemeQuery>({
      query: ColorSchemeDocument,
      data: {
        __typename: "Query",
        colorScheme,
      },
    })
  } catch {
    console.warn("impossible to update beta")
  }
}

export const setFeedbackModalShown = (client: ApolloClient<unknown>, shown: boolean) => {
  try {
    client.writeQuery<FeedbackModalShownQuery>({
      query: FeedbackModalShownDocument,
      data: {
        __typename: "Query",
        feedbackModalShown: shown,
      },
    })
  } catch {
    console.warn("unable to update feedbackModalShown")
  }
}

export const setHasPromptedSetDefaultAccount = (client: ApolloClient<unknown>) => {
  try {
    client.writeQuery({
      query: HasPromptedSetDefaultAccountDocument,
      data: {
        __typename: "Query",
        hasPromptedSetDefaultAccount: true,
      },
    })
  } catch {
    console.warn("impossible to update hasPromptedSetDefaultAccount")
  }
}

export const setIntroducingCirclesModalShown = (client: ApolloClient<unknown>) => {
  try {
    client.writeQuery<IntroducingCirclesModalShownQuery>({
      query: IntroducingCirclesModalShownDocument,
      data: {
        __typename: "Query",
        introducingCirclesModalShown: true,
      },
    })
  } catch {
    console.warn("unable to update introducingCirclesModalShown")
  }
}

export const setInnerCircleCachedValue = (
  client: ApolloClient<unknown>,
  innerCircleValue: number,
) => {
  try {
    client.writeQuery<InnerCircleValueQuery>({
      query: InnerCircleValueDocument,
      data: {
        __typename: "Query",
        innerCircleValue,
      },
    })
  } catch {
    console.warn("unable to update InnerCircleValueDocument")
  }
}
