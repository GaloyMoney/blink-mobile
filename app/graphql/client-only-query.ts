import { gql } from "@apollo/client"

export const LAST_CLIPBOARD_PAYMENT = gql`
  query LastClipboardPayment {
    lastClipboardPayment @client
  }
`
