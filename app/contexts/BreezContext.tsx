import React, { createContext, useEffect, useState } from "react"
import { WalletCurrency } from "@app/graphql/generated"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { initializeBreezSDK } from "@app/utils/breez-sdk"
import { nodeInfo } from "@breeztech/react-native-breez-sdk"

type BtcWallet = {
  id: string
  walletCurrency: WalletCurrency
  balance: number
}

interface BreezInterface {
  refreshBreez: () => void
  loading: boolean
  btcWallet: BtcWallet
}

export const BreezContext = createContext<BreezInterface>({
  refreshBreez: () => {},
  loading: false,
  btcWallet: {
    id: "",
    walletCurrency: "BTC",
    balance: 0,
  },
})

type Props = {
  children: string | JSX.Element | JSX.Element[]
}

export const BreezProvider = ({ children }: Props) => {
  const { persistentState, updateState } = usePersistentStateContext()
  const [loading, setLoading] = useState(false)
  const [btcWallet, setBtcWallet] = useState<BtcWallet>({
    id: "",
    walletCurrency: "BTC",
    balance: persistentState.breezBalance || 0,
  })

  useEffect(() => {
    if (persistentState.isAdvanceMode) {
      getBreezInfo()
    } else {
      setBtcWallet({
        id: "",
        walletCurrency: "BTC",
        balance: 0,
      })
    }
  }, [persistentState.isAdvanceMode])

  const getBreezInfo = async () => {
    setLoading(true)
    await initializeBreezSDK()
    const nodeState = await nodeInfo()

    setBtcWallet({
      id: nodeState.id,
      walletCurrency: WalletCurrency.Btc,
      balance: nodeState.channelsBalanceMsat / 1000,
    })
    updateState((state: any) => {
      if (state)
        return {
          ...state,
          breezBalance: nodeState.channelsBalanceMsat / 1000,
        }
      return undefined
    })
    setLoading(false)
  }

  const refreshBreez = () => {
    if (persistentState.isAdvanceMode) getBreezInfo()
  }

  return (
    <BreezContext.Provider value={{ btcWallet, loading, refreshBreez }}>
      {children}
    </BreezContext.Provider>
  )
}
