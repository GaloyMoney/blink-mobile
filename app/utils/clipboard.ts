import Clipboard from "@react-native-community/clipboard"
import { ApolloClient } from "@apollo/client"

import {
  LAST_CLIPBOARD_PAYMENT,
  modalClipboardVisibleVar,
} from "../graphql/client-only-query"
import { cache } from "../graphql/cache"
import { INetwork } from "../types/network"
import { parsingv2 } from "@galoymoney/client"
import { lnurlDomains } from "@app/screens/send-bitcoin-screen/send-bitcoin-destination-screen"
const parsePaymentDestination = parsingv2.parsePaymentDestination

type ShowModalClipboardIfValidPaymentInput = {
  client: ApolloClient<unknown>
  network: INetwork
  myPubKey: string
  username: string
}

export const showModalClipboardIfValidPayment = async ({
  network,
  myPubKey,
}: ShowModalClipboardIfValidPaymentInput): Promise<void> => {
  const clipboard = await Clipboard.getString()

  if (!clipboard) {
    return
  }

  const data = cache.readQuery<{ lastClipboardPayment?: string }, never>({
    query: LAST_CLIPBOARD_PAYMENT,
  })

  if (clipboard === data?.lastClipboardPayment) {
    return
  }

  const parsedDestination = parsePaymentDestination({
    destination: clipboard,
    network,
    pubKey: myPubKey,
    lnAddressDomains: lnurlDomains,
  })

  const clipboardShouldPrompt = "valid" in parsedDestination && parsedDestination.valid

  if (!clipboardShouldPrompt) {
    return
  }

  modalClipboardVisibleVar(true)
}

export const copyPaymentInfoToClipboard = (paymentInfo: string): void => {
  cache.writeQuery({
    query: LAST_CLIPBOARD_PAYMENT,
    data: {
      lastClipboardPayment: paymentInfo,
    },
  })
  Clipboard.setString(paymentInfo)
}
