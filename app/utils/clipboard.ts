import Clipboard from "@react-native-community/clipboard"
import { ApolloClient } from "@apollo/client"

import { validPayment } from "./parsing"
import {
  LAST_CLIPBOARD_PAYMENT,
  modalClipboardVisibleVar,
} from "../graphql/client-only-query"
import { cache } from "../graphql/cache"
import { INetwork } from "../types/network"

type ShowModalClipboardIfValidPaymentInput = {
  client: ApolloClient<unknown>
  network: INetwork
}

export const showModalClipboardIfValidPayment = async (
  // eslint-disable-next-line @typescript-eslint/ban-types
  { client, network }: ShowModalClipboardIfValidPaymentInput,
): Promise<void> => {
  const clipboard = await Clipboard.getString()

  const data = cache.readQuery<{ lastClipboardPayment?: string }, never>({
    query: LAST_CLIPBOARD_PAYMENT,
  })

  if (clipboard === data?.lastClipboardPayment) {
    return
  }

  const { valid } = validPayment(clipboard, network, client)
  if (!valid) {
    return
  }

  modalClipboardVisibleVar(true)
}
