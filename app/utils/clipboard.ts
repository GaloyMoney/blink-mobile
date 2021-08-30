import Clipboard from "@react-native-community/clipboard"
import { ApolloClient } from "@apollo/client"

import { validPayment } from "./parsing"
import { walletIsActive } from "../graphql/query"
import {
  LAST_CLIPBOARD_PAYMENT,
  modalClipboardVisibleVar,
} from "../graphql/client-only-query"
import { Token } from "./token"
import { cache } from "../graphql/cache"
import { LastClipboardPayment } from "../graphql/__generated__/LastClipboardPayment"

export const showModalClipboardIfValidPayment = async (
  // eslint-disable-next-line @typescript-eslint/ban-types
  client: ApolloClient<object>,
): Promise<void> => {
  const clipboard = await Clipboard.getString()

  if (!walletIsActive(client)) {
    return
  }

  const data = cache.readQuery<LastClipboardPayment>({ query: LAST_CLIPBOARD_PAYMENT })
  if (clipboard === data?.lastClipboardPayment) {
    return
  }

  const { valid } = validPayment(clipboard, Token.getInstance().network, client)
  if (!valid) {
    return
  }

  modalClipboardVisibleVar(true)
}
