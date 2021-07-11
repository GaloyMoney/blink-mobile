import Clipboard from "@react-native-community/clipboard"

import { validPayment } from "./parsing"
import { modalClipboardVisibleVar, walletIsActive } from "../graphql/query"
import { Token } from "./token"
import { ApolloClient } from "@apollo/client"

// eslint-disable-next-line @typescript-eslint/ban-types
export const checkClipboard = async (client: ApolloClient<object>): Promise<void> => {
  const clipboard = await Clipboard.getString()

  if (!walletIsActive(client)) {
    return
  }

  const { valid } = validPayment(clipboard, new Token().network, client)
  if (!valid) {
    return
  }

  modalClipboardVisibleVar(true)
}
