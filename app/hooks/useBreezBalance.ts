import { useState, useEffect } from "react"
import { nodeInfo } from "@breeztech/react-native-breez-sdk"
import { initializeBreezSDK } from "@app/utils/breez-sdk"

const useBreezBalance = (): [number | null, () => void] => {
  const [balance, setBalance] = useState<number | null>(null)
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
    }

    initializeAndFetchBalance()
  }, [refresh])

  const refreshBreezBalance = () => {
    setRefresh((prev) => prev + 1)
  }

  return [balance, refreshBreezBalance]
}

export default useBreezBalance
