import { useMyUpdatesSubscription } from "@app/graphql/generated"
import * as React from "react"

type UseMyUpdates = {
  intraLedgerUpdate: {
    txNotificationType: string
    amount: number
    usdPerSat: number
  } | null
  lnUpdate: {
    paymentHash: string
    status: string
  } | null
  onChainUpdate: {
    txNotificationType: string
    txHash: string
    amount: number
    usdPerSat: number
  } | null
  mySubscriptionLoading: boolean
}

export const useSubscriptionUpdates = (): UseMyUpdates => {
  const { data, loading } = useMyUpdatesSubscription()

  const intraLedgerUpdate = React.useRef<UseMyUpdates["intraLedgerUpdate"] | null>(null)
  const lnUpdate = React.useRef<UseMyUpdates["lnUpdate"] | null>(null)
  const onChainUpdate = React.useRef<UseMyUpdates["onChainUpdate"] | null>(null)

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
