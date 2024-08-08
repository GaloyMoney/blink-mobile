import { useState, useEffect } from "react"
import { nodeInfo } from "@breeztech/react-native-breez-sdk"
import { initializeBreezSDK } from "@app/utils/breez-sdk"
import { usePersistentStateContext } from "@app/store/persistent-state"

const useBreezBalance = (): [number | null, () => void] => {
  const { persistentState, updateState } = usePersistentStateContext()

  const [balance, setBalance] = useState<number | null>(
    persistentState.breezBalance || null,
  )
  const [refresh, setRefresh] = useState<number>(0)

  useEffect(() => {
    const initializeAndFetchBalance = async () => {
      await initializeBreezSDK()
      const nodeState = await nodeInfo()
      const balance = nodeState.channelsBalanceMsat
      // console.log("Total balance", balance)
      // console.log("On Chain Balance", nodeState.onchainBalanceMsat)
      // console.log("Channel Balance", nodeState.channelsBalanceMsat)
      setBalance(balance / 1000)
      updateState((state: any) => {
        if (state)
          return {
            ...state,
            breezBalance: balance / 1000,
          }
        return undefined
      })
    }

    if (persistentState.isAdvanceMode) initializeAndFetchBalance()
  }, [refresh, persistentState.isAdvanceMode])

  const refreshBreezBalance = () => {
    setRefresh((prev) => prev + 1)
  }

  return [balance, refreshBreezBalance]
}

export default useBreezBalance
