import Clipboard from "@react-native-community/clipboard"
import { ApolloClient } from "@apollo/client"

import { validPayment } from "./parsing"
import { modalClipboardVisibleVar, walletIsActive } from "../graphql/query"
import { Token } from "./token"
import { loadString } from "./storage"

export const LAST_CLIPBOARD_PAYMENT = "last_clipboard_payment"

export const showModalClipboardIfValidPayment = async (
  // eslint-disable-next-line @typescript-eslint/ban-types
  client: ApolloClient<object>,
): Promise<void> => {
  const clipboard = await Clipboard.getString()

  if (!walletIsActive(client)) {
    return
  }

  if (clipboard === (await loadString(LAST_CLIPBOARD_PAYMENT))) {
    return
  }

  const { valid } = validPayment(clipboard, new Token().network, client)
  if (!valid) {
    return
  }

  modalClipboardVisibleVar(true)
}
