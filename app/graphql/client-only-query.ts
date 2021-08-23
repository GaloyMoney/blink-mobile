import { gql, makeVar } from "@apollo/client"
import _ from "lodash"

export const prefCurrencyVar = makeVar<CurrencyType>("USD")

export const nextPrefCurrency = (): void => {
  const units: CurrencyType[] = ["BTC", "USD"]
  const currentIndex = _.indexOf(units, prefCurrencyVar())
  prefCurrencyVar(units[(currentIndex + 1) % units.length])
}

export const modalClipboardVisibleVar = makeVar(false)

export const LAST_CLIPBOARD_PAYMENT = gql`
  query LastClipboardPayment {
    lastClipboardPayment @client
  }
`
