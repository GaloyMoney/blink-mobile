import { useEffect, useState } from "react"
import {
  SwapInfo,
  inProgressSwap,
  nodeInfo,
  receiveOnchain,
} from "@breeztech/react-native-breez-sdk"
import { breezSDKInitialized, prepareRedeem } from "@app/utils/breez-sdk"

export const useRedeem = () => {
  const [pendingSwap, setPendingSwap] = useState<SwapInfo | null>()

  useEffect(() => {
    if (breezSDKInitialized) {
      checkClosedChannel()
      checkInProgressSwap()
    }
  }, [breezSDKInitialized])

  const checkClosedChannel = async () => {
    try {
      const nodeState = await nodeInfo()
      console.log("NODE INFO>>>>>>>>>>>>>>>", nodeState)
      const swapInfo = await receiveOnchain({})
      console.log("SWAP INFO>>>>>>>>>>>>>>>", swapInfo)

      if (nodeState.onchainBalanceMsat > swapInfo.minAllowedDeposit * 1000) {
        await prepareRedeem(swapInfo.bitcoinAddress)
        setTimeout(() => {
          checkInProgressSwap()
        }, 500)
      }
    } catch (err) {
      console.log("ERROR checkClosedChannel", err)
    }
  }

  const checkInProgressSwap = async () => {
    try {
      const swap = await inProgressSwap()
      console.log("SWAP IN PROGRESS>>>>>>>>>>>>>>>>>>>>>>", swap)
      setPendingSwap(swap)
    } catch (err) {
      console.error(err)
    }
  }

  return { pendingSwap, checkInProgressSwap }
}
