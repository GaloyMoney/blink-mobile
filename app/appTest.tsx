import React from "react"
import { View } from "react-native"
import "node-libs-react-native/globals" // needed for Buffer?

import {
  connect,
  defaultConfig,
  getInfo,
  LiquidNetwork,
  listPayments,
  prepareReceivePayment,
  prepareSendPayment,
  receivePayment,
  sendPayment,
} from "@breeztech/react-native-breez-sdk-liquid"
import * as bip39 from "bip39"
const appTest = () => {
  React.useEffect(() => {
    let bolt11Invoice = null

    const asyncFn = async () => {
      try {
        // Get the mnemonic
        console.log("$$$$$$$$$$$$$$$$$$$")
        const mnemonic = bip39.generateMnemonic(128)
        console.log(">>>>>>>>>???????>????????>????????", mnemonic)
        // Connect using the config
        const config = await defaultConfig(LiquidNetwork.MAINNET)
        console.log(">>>>>>>>>>>>>>>", config)
        await connect({ config, mnemonic })

        // Get wallet info
        let getInfoRes = await getInfo()
        console.log("???????????????", getInfoRes)
        // Historical payments list
        let payments = listPayments({})

        /* Receive lightning payment */

        let prepareReceiveRes = await prepareReceivePayment({ payerAmountSat: 1000 })

        // Get the fees required for this payment

        let receivePaymentRes = await receivePayment({ prepareRes: prepareReceiveRes })

        // Wait for payer to pay.... once successfully paid an event of `paymentSucceeded` will be emitted.

        /* Send lightning payment */

        // Set the `bolt11Invoice` to enable sending in the example app
        if (bolt11Invoice) {
          let prepareSendRes = await prepareSendPayment({ invoice: bolt11Invoice })

          // Get the fees required for this payment

          let sendPaymentRes = await sendPayment(prepareSendRes)

          // Once successfully paid an event of `paymentSucceeded` will be emitted.
        }
      } catch (e) {
        console.log(`Error: ${e}`)
      }
    }

    asyncFn()
  }, [])

  return <View style={{ flex: 1, backgroundColor: "yellowgreen" }}></View>
}

export default appTest
