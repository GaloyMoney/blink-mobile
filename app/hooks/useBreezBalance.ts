import { useState, useEffect } from "react"
import { nodeInfo } from "@breeztech/react-native-breez-sdk"
import connectBreezSDK from "@app/utils/breez-sdk"

const useBreezBalance = (): number | null => {
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    const initializeAndFetchBalance = async () => {
      console.log("initializing breez balance hook")
      await connectBreezSDK()
      console.log("connected to breez sdk")
      const nodeState = await nodeInfo()
      const balance = nodeState.channelsBalanceMsat + nodeState.onchainBalanceMsat
      console.log("getting balance", balance)
      setBalance(balance)
    }

    initializeAndFetchBalance()
  }, [])

  return balance
}

export default useBreezBalance
