import React, { createContext, useEffect, useState } from "react"
import { WalletCurrency } from "@app/graphql/generated"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { initializeBreezSDK } from "@app/utils/breez-sdk-liquid"
import { getInfo } from "@breeztech/react-native-breez-sdk-liquid"
import { Platform } from "react-native"

type BtcWallet = {
  id: string
  walletCurrency: WalletCurrency
  balance: number
  pendingReceiveSat: number
  pendingSendSat: number
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
    pendingReceiveSat: 0,
    pendingSendSat: 0,
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
    pendingReceiveSat: 0,
    pendingSendSat: 0,
  })

  useEffect(() => {
    if (Platform.OS === "ios" && Number(Platform.Version) < 13) {
      updateState((state: any) => {
        if (state)
          return {
            ...state,
            isAdvanceMode: false,
          }
        return undefined
      })
    } else {
      if (persistentState.isAdvanceMode) {
        getBreezInfo()
      } else {
        setBtcWallet({
          id: "",
          walletCurrency: "BTC",
          balance: 0,
          pendingReceiveSat: 0,
          pendingSendSat: 0,
        })
      }
    }
  }, [persistentState.isAdvanceMode])

  const getBreezInfo = async () => {
    setLoading(true)
    await initializeBreezSDK()
    const walletInfo = await getInfo()

    setBtcWallet({
      id: walletInfo.pubkey,
      walletCurrency: WalletCurrency.Btc,
      balance: walletInfo.balanceSat,
      pendingReceiveSat: walletInfo.pendingReceiveSat,
      pendingSendSat: walletInfo.pendingSendSat,
    })
    updateState((state: any) => {
      if (state)
        return {
          ...state,
          breezBalance: walletInfo.balanceSat,
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
