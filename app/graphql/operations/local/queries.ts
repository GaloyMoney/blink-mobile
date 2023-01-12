import { gql } from "@apollo/client"

export default gql`
  query LastClipboardPayment {
    lastClipboardPayment @client
  }

  query HideBalance {
    hideBalance @client
  }

  query HiddenBalanceToolTip {
    hiddenBalanceToolTip @client
  }
`
