import { getDescription } from "./bolt11"
import * as lightningPayReq from 'bolt11'
import moment from "moment"
const bitcoin = require('bitcoinjs-lib');

// TODO: look if we own the address

export type IPaymentType = "lightning" | "onchain" | "onchainAndLightning" | undefined

export interface IValidPaymentReponse {
  valid: boolean,
  errorMessage?: string | undefined,
  invoice?: string | undefined, // for lightning 
  address?: string | undefined, // for bitcoin
  amount?: number | undefined,
  amountless?: boolean | undefined,
  note?: string | undefined,
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

export const validPayment = (input: string, network: INetwork): IValidPaymentReponse => {
  if (!input) {
    return {valid: false, errorMessage: `string is null or empty`}
  }

  // invoice might start with 'lightning:', 'bitcoin:'
  let [protocol, invoice] = input.split(":")
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

    invoice = protocol
  } else {
    // no schema
    invoice = protocol
  }
  
  if (paymentType === "onchain" || paymentType === undefined) {
      // removing metadata
      // TODO manage amount 
      invoice = invoice.split('?')[0]
  
      try {
        bitcoin.address.toOutputScript(invoice, mappingToBitcoinJs(network));
        paymentType = "onchain"
        return {valid: true, paymentType, address: invoice}
      } catch (e) {
        return {valid: false, errorMessage: e}
      }

  } else if (paymentType === "lightning") {
    const payReq = lightningPayReq.decode(invoice)
    // console.log(JSON.stringify({ payReq }, null, 2))
    
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
      return {valid: false, errorMessage: "invoice has expired", paymentType}
    }
    
    note = getDescription(payReq) 
    return {valid: true, invoice, amount, amountless, note, paymentType}

  } else {
    return {valid: false, errorMessage: `We are unable to detect an invoice or payment address`}
  }

}