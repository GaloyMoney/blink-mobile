import { getDescription } from "./lightning"
import { Token } from "./token"
import * as lightningPayReq from 'bolt11'
import moment from "moment"

type valid = boolean 
type errorMEssage = string | null
type invoice = string | null
type amount = number | null
type amountless = boolean | null 
type note = string | null

// TODO add onChain
// look if we own the address

export const validInvoice = (s: string): [valid, errorMEssage?, invoice?, amount?, amountless?, note?] => {
  if (s === "") {
    return [false, `string is empty`]
  }

  // invoice might start with 'lightning:', 'bitcoin:', something else, or have the invoice directly
  let [protocol, invoice] = s.split(":")

  protocol = protocol.toLowerCase()
  if (protocol === "bitcoin") {
    return [false, "Bitcoin on-chain transactions are coming to the app but we're only accepting lightning for now."]
  } else if (protocol.startsWith("ln") && invoice === undefined) {
    if(new Token().network === "testnet" && protocol.startsWith("lnbc")) {
      return [false, `You're trying to pay a mainnet invoice. The settings for the app is testnet`]
    }
    if(new Token().network === "mainnet" && protocol.startsWith("lntb")) {
      return [false, `You're trying to pay a testnet invoice. The settings for the app is mainnet`]
    }

    invoice = protocol
  } else if (protocol !== "lightning") {
    let message = `Only lightning procotol is accepted for now.`
    message += message === "" ? "" : `\n\ngot following: "${protocol}"`
    return [false, message]
  }

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
  if (payReq?.timeExpireDate < moment().unix()) {
    console.tron.log("invoice has expired")
    return [false, "invoice has expired"]
  }
  
  note = getDescription(payReq) 
  return [true,, invoice, amount, amountless, note]
}