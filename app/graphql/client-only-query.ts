import { ApolloClient, gql, makeVar } from "@apollo/client"
import indexOf from "lodash.indexof"
import analytics from "@react-native-firebase/analytics"

import jwtDecode from "jwt-decode"

import type { INetwork } from "../types/network"
import { loadString } from "../utils/storage"

// key used to stored the token within the phone
export const TOKEN_KEY = "GaloyToken"

const decodeToken = (token) => {
  try {
    const { uid, network } = jwtDecode<JwtPayload>(token)
    console.log({ uid, network })
    return { uid, network }
  } catch (err) {
    console.log(err.toString())
    return null
  }
}

export const authTokenVar = makeVar<TokenPayload | null>(null)

export const loadAuthToken = async (): Promise<void> => {
  let uid: string
  let network: INetwork
  const token: string | null = await loadString(TOKEN_KEY)
  if (token) {
    ;({ uid, network } = decodeToken(token))
    analytics().setUserId(uid)
    authTokenVar({ token, uid, network })
  }
}

export const prefCurrencyVar = makeVar<CurrencyType>("USD")
export const modalClipboardVisibleVar = makeVar(false)

export const nextPrefCurrency = (): void => {
  const units: CurrencyType[] = ["BTC", "USD"]
  const currentIndex = indexOf(units, prefCurrencyVar())
  prefCurrencyVar(units[(currentIndex + 1) % units.length])
}

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
