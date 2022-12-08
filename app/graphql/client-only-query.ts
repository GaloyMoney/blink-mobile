import { ApolloClient, gql, makeVar } from "@apollo/client"
import indexOf from "lodash.indexof"

export const prefCurrencyVar = makeVar<CurrencyType>("USD")

export const nextPrefCurrency = (): void => {
  const units: CurrencyType[] = ["BTC", "USD"]
  const currentIndex = indexOf(units, prefCurrencyVar())
  prefCurrencyVar(units[(currentIndex + 1) % units.length])
}

export const PRICE_CACHE = gql`
  query priceCache {
    price @client
  }
`

export const LAST_CLIPBOARD_PAYMENT = gql`
  query LastClipboardPayment {
    lastClipboardPayment @client
  }
`

export const HIDE_BALANCE = gql`
  query HideBalance {
    hideBalance @client
  }
`

export const HIDDEN_BALANCE_TOOL_TIP = gql`
  query HiddenBalanceToolTip {
    hiddenBalanceToolTip @client
  }
`

export const saveHideBalance = (
  client: ApolloClient<unknown>,
  status: boolean,
): boolean => {
  try {
    client.writeQuery({
      query: HIDE_BALANCE,
      data: {
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
    client.writeQuery({
      query: HIDDEN_BALANCE_TOOL_TIP,
      data: {
        hiddenBalanceToolTip: status,
      },
    })
    return status
  } catch {
    return false
  }
}
