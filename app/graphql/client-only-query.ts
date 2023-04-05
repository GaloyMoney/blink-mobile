import { ApolloClient, gql } from "@apollo/client"
import {
  BetaDocument,
  BetaQuery,
  ColorSchemeDocument,
  ColorSchemeQuery,
  HiddenBalanceToolTipDocument,
  HiddenBalanceToolTipQuery,
  HideBalanceDocument,
  HideBalanceQuery,
  NewNameBlinkCounterDocument,
  NewNameBlinkCounterQuery,
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
    colorScheme @client
  }

  query newNameBlinkCounter {
    newNameBlinkCounter @client
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

export const updateNewNameBlink = (client: ApolloClient<unknown>, counter: number) => {
  try {
    client.writeQuery<NewNameBlinkCounterQuery>({
      query: NewNameBlinkCounterDocument,
      data: {
        __typename: "Query",
        newNameBlinkCounter: counter + 1,
      },
    })
  } catch {
    console.warn("impossible to update beta")
  }
}
