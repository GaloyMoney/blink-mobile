import { ApolloClient, makeVar } from "@apollo/client"
import indexOf from "lodash.indexof"
import { HiddenBalanceToolTipDocument, HideBalanceDocument } from "./generated"

export const prefCurrencyVar = makeVar<CurrencyType>("USD")

export const nextPrefCurrency = (): void => {
  const units: CurrencyType[] = ["BTC", "USD"]
  const currentIndex = indexOf(units, prefCurrencyVar())
  prefCurrencyVar(units[(currentIndex + 1) % units.length])
}

export const saveHideBalance = (
  client: ApolloClient<unknown>,
  status: boolean,
): boolean => {
  try {
    client.writeQuery({
      query: HideBalanceDocument,
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
      query: HiddenBalanceToolTipDocument,
      data: {
        hiddenBalanceToolTip: status,
      },
    })
    return status
  } catch {
    return false
  }
}
