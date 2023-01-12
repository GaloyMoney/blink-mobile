import Clipboard from "@react-native-community/clipboard"

import { cache } from "../graphql/cache"
import { LastClipboardPaymentDocument } from "@app/graphql/generated"

export const copyPaymentInfoToClipboard = (paymentInfo: string): void => {
  cache.writeQuery({
    query: LastClipboardPaymentDocument,
    data: {
      lastClipboardPayment: paymentInfo,
    },
  })
  Clipboard.setString(paymentInfo)
}
