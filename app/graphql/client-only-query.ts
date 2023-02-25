import { ApolloClient, makeVar, gql } from "@apollo/client"
import {
  BetaDocument,
  BetaQuery,
  HiddenBalanceToolTipDocument,
  HiddenBalanceToolTipQuery,
  HideBalanceDocument,
  HideBalanceQuery,
} from "./generated"

export const prefCurrencyVar = makeVar<CurrencyType>("USD")

export const nextPrefCurrency = (): void => {
  const units: CurrencyType[] = ["BTC", "USD"]
  const currentIndex = units.indexOf(prefCurrencyVar())
  prefCurrencyVar(units[(currentIndex + 1) % units.length])
}

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
    console.warn("impossible to activate beta")
  }
}
