import { gql, useSubscription } from "@apollo/client"
import * as React from "react"

type UseMyUpdates = {
  intraLedgerUpdate: {
    txNotificationType: string
    amount: number
    usdPerSat: number
  }
  lnUpdate: {
    paymentHash: string
    status: string
  }
  onChainUpdate: {
    txNotificationType: string
    txHash: string
    amount: number
    usdPerSat: number
  }
  mySubscriptionLoading: boolean
}

const MY_UPDATES_SUBSCRIPTION = gql`
  subscription myUpdates {
    myUpdates {
      errors {
        message
      }
      update {
        type: __typename
        ... on Price {
          base
          offset
          currencyUnit
          formattedAmount
        }
        ... on LnUpdate {
          paymentHash
          status
        }
        ... on OnChainUpdate {
          txNotificationType
          txHash
          amount
          usdPerSat
        }
        ... on IntraLedgerUpdate {
          txNotificationType
          amount
          usdPerSat
        }
      }
    }
  }
`

export const useSubscriptionUpdates = (): UseMyUpdates => {
  const { data, loading } = useSubscription(MY_UPDATES_SUBSCRIPTION)

  const intraLedgerUpdate = React.useRef<UseMyUpdates["intraLedgerUpdate"]>(null)
  const lnUpdate = React.useRef<UseMyUpdates["lnUpdate"]>(null)
  const onChainUpdate = React.useRef<UseMyUpdates["onChainUpdate"]>(null)

  if (data?.myUpdates?.update) {
    if (data.myUpdates.update.type === "IntraLedgerUpdate") {
      intraLedgerUpdate.current = data.myUpdates.update
    }
    if (data.myUpdates.update.type === "LnUpdate") {
      lnUpdate.current = data.myUpdates.update
    }
    if (data.myUpdates.update.type === "OnChainUpdate") {
      onChainUpdate.current = data.myUpdates.update
    }
  }

  return {
    intraLedgerUpdate: intraLedgerUpdate.current,
    lnUpdate: lnUpdate.current,
    onChainUpdate: onChainUpdate.current,
    mySubscriptionLoading: loading,
  }
}
