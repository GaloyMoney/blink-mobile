import { getDescription } from "./lightning"
import * as lightningPayReq from 'bolt11'
import moment from "moment"
const bitcoin = require('bitcoinjs-lib');

// TODO: look if we own the address

type IAddressType = "lightning" | "onchain" | "onchainAndLightning" | undefined

interface IValidPaymentReponse {
  valid: boolean,
  errorMessage?: string | undefined,
  invoice?: string | undefined,
  amount?: number | undefined,
  amountless?: boolean | undefined,
  note?: string | undefined,
  addressType?: IAddressType
}

export const validPayment = (input: string, network?: string): IValidPaymentReponse => {
  if (!input) {
    return {valid: false, errorMessage: `string is null or empty`}
  }

  // invoice might start with 'lightning:', 'bitcoin:'
  let [protocol, invoice] = input.split(":")
  let addressType: IAddressType = undefined

  if (protocol.toLowerCase() === "bitcoin") {
    addressType = "onchain"
    
  // TODO manage bitcoin= case
  
  } else if (protocol.toLowerCase() === "lightning") {
    addressType = "lightning"

  // no protocol. let's see if this could have an address directly
  } else if (invoice === undefined && 
    (protocol.toLowerCase().startsWith("bc") || protocol.toLowerCase().startsWith("1") || protocol.toLowerCase().startsWith("3"))) {
    // TODO: Verify pattern of how bitcoin address are supposed to start. ie: with old addresses?

    addressType = "onchain"
    invoice = protocol
  } else if (protocol.toLowerCase().startsWith("ln")) {
    // possibly a lightning address?

    addressType = "lightning"

    if(network === "testnet" && protocol.toLowerCase().startsWith("lnbc")) {
      return {valid: false, errorMessage: `You're trying to pay a mainnet invoice. The settings for the app is testnet`}
    }

    if(network === "mainnet" && protocol.toLowerCase().startsWith("lntb")) {
      return {valid: false, errorMessage: `You're trying to pay a testnet invoice. The settings for the app is mainnet`}
    }

    invoice = protocol
  } else {
    return {valid: false, errorMessage: `We are unable to detect the payment address`}
  }

  if (addressType === "lightning") {
    const payReq = lightningPayReq.decode(invoice)
    console.tron.log({ payReq })
    
    let amount, amountless, note
    
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
      console.tron.log("invoice has expired")
      return {valid: false, errorMessage: "invoice has expired", addressType}
    }
    
    note = getDescription(payReq) 
    return {valid: true, invoice, amount, amountless, note, addressType}

  } else if (addressType === "onchain") {
    invoice = invoice.split('?')[0]

    try {
      // TODO network needs mapping
      bitcoin.address.toOutputScript(invoice);
      return {valid: true, addressType}
    } catch (e) {
      return {valid: false, errorMessage: e}
    }

  } else {
    return {valid: false, errorMessage: "unvalid path"}
  }

}