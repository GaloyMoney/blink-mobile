import { getDescription } from "./bolt11"
import * as lightningPayReq from 'bolt11'
import moment from "moment"
const bitcoin = require('bitcoinjs-lib');
var url = require('url');

// TODO: look if we own the address

export type IPaymentType = "lightning" | "onchain" | "onchainAndLightning" | "username" | undefined

export interface IValidPaymentReponse {
  valid: boolean,
  errorMessage?: string | undefined,
  invoice?: string | undefined, // for lightning 
  address?: string | undefined, // for bitcoin
  amount?: number | undefined,
  amountless?: boolean | undefined,
  memo?: string | undefined,
  paymentType?: IPaymentType
}

// TODO: enforce this from the backend
type INetwork = "mainnet" | "testnet" | "regtest"

const mappingToBitcoinJs = (input: INetwork) => {
  switch (input) {
    case "mainnet": return bitcoin.networks.mainnet
    case "testnet": return bitcoin.networks.testnet
    case "regtest": return bitcoin.networks.regtest
  }
}

// from https://github.com/bitcoin/bips/blob/master/bip-0020.mediawiki#Transfer%20amount/size
const reAmount = /^(([\d.]+)(X(\d+))?|x([\da-f]*)(\.([\da-f]*))?(X([\da-f]+))?)$/i;
function parseAmount(txt) {
  var m = txt.match(reAmount);
  return m[5] ? (
      (
          parseInt(m[5], 16) +
          (m[7] ? (parseInt(m[7], 16) * Math.pow(16, -(m[7].length))) : 0)
      ) * (
          m[9] ? Math.pow(16, parseInt(m[9], 16)) : 0x10000
      )
  ) : (
          m[2]
      *
          (m[4] ? Math.pow(10, m[4]) : 1e8)
  );
}

export const validPayment = (input: string, network: INetwork): IValidPaymentReponse => {
  if (!input) {
    return {valid: false, errorMessage: `string is null or empty`}
  }

  // input might start with 'lightning:', 'bitcoin:'
  let [protocol, data] = input.split(":")
  let paymentType: IPaymentType = undefined

  if (protocol.toLowerCase() === "bitcoin") {
    paymentType = "onchain"
    
  // TODO manage bitcoin= case
  
  } else if (protocol.toLowerCase() === "lightning") {
    paymentType = "lightning"

  // no protocol. let's see if this could have an address directly
  } else if (protocol.toLowerCase().startsWith("ln")) {
    // possibly a lightning address?

    paymentType = "lightning"

    if(network === "testnet" && protocol.toLowerCase().startsWith("lnbc")) {
      return {valid: false, errorMessage: `You're trying to pay a mainnet invoice. The settings for the app is testnet`}
    }

    if(network === "mainnet" && protocol.toLowerCase().startsWith("lntb")) {
      return {valid: false, errorMessage: `You're trying to pay a testnet invoice. The settings for the app is mainnet`}
    }

    data = protocol
  } else {
    // no schema
    data = protocol
  }
  
  if (paymentType === "onchain" || paymentType === undefined) {
    try {
      const decodedData = url.parse(data, true)
      const address = decodedData.pathname // using url node library. the address is exposed as the "host" here
      let amount 

      try {
        amount = parseAmount(decodedData.query.amount)
      } catch (err) {
        console.tron?.log(`can't decode amount ${err}`)
      }

      // will throw if address is not valid
      bitcoin.address.toOutputScript(address, mappingToBitcoinJs(network));
      paymentType = "onchain"
      return {valid: true, paymentType, address, amount}

    } catch (e) {
      console.tron?.warn(`issue with payment ${e}`)
      return {valid: false, errorMessage: e}
    }
  } else if (paymentType === "lightning") {
    const payReq = lightningPayReq.decode(data)
    // console.log(JSON.stringify({ payReq }, null, 2))
    
    let amount, amountless, memo
    
    if (payReq.satoshis || payReq.millisatoshis) {
      amount = payReq.satoshis ?? Number(payReq.millisatoshis) * 1000
      amountless = false
    } else {
      amount = 0
      amountless = true
    }
  
    // TODO: show that the invoice has expired in the popup
    // TODO: manage testnet as well

    if (payReq?.timeExpireDate < moment().unix()) {
      return {valid: false, errorMessage: "invoice has expired", paymentType}
    }
    
    memo = getDescription(payReq) 
    return {valid: true, invoice: data, amount, amountless, memo, paymentType}

  } else {
    return {valid: false, errorMessage: `We are unable to detect an invoice or payment address`}
  }

}