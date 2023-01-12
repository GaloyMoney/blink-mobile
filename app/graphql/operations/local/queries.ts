import { gql } from "@apollo/client"

export default gql`
  query HideBalance {
    hideBalance @client
  }

  query HiddenBalanceToolTip {
    hiddenBalanceToolTip @client
  }
`
