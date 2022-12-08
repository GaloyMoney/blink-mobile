import Clipboard from "@react-native-community/clipboard"

import { LAST_CLIPBOARD_PAYMENT } from "../graphql/client-only-query"
import { cache } from "../graphql/cache"

export const copyPaymentInfoToClipboard = (paymentInfo: string): void => {
  cache.writeQuery({
    query: LAST_CLIPBOARD_PAYMENT,
    data: {
      lastClipboardPayment: paymentInfo,
    },
  })
  Clipboard.setString(paymentInfo)
}
