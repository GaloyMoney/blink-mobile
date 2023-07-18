import { useState, useEffect } from "react"
import NodeState from "@breeztech/react-native-breez-sdk"
import connectBreezSDK from "@app/utils/breez-sdk"

const useBreezBalance = (): number | null => {
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    const initializeAndFetchBalance = async () => {
      console.log("initializing breez balance hook")
      await connectBreezSDK()
      console.log("connected to breez sdk")
      const nodeInfo = await NodeState.nodeInfo()
      const balance = nodeInfo.channelsBalanceMsat + nodeInfo.onchainBalanceMsat
      console.log("getting balance", balance)
      setBalance(balance)
    }

    initializeAndFetchBalance()
  }, [])

  return balance
}

export default useBreezBalance
