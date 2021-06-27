import { bech32 } from "bech32"

import { SUPPORTED_PROTOCOLS } from "../constants/lnurl"

import { satToMsat } from "./amount"

import type { LNUrlPay } from "../types/lnurl"

export const isLnUrl = (invoice: string): boolean => invoice.toLowerCase().startsWith("lnurl")

export const isProtocolSupported = (tag: string): boolean => !!SUPPORTED_PROTOCOLS[tag]

export const isAmountValid = (amount: number, minSendable: number, maxSendable: number): boolean =>
  minSendable < amount && amount < maxSendable

export const parseUrl = async (invoice: string): Promise<LNUrlPay> => {
  const { words } = bech32.decode(invoice, 2000)

  const url = Buffer.from(bech32.fromWords(words)).toString()

  return fetch(url)
    .then((response) => response.json())
    .then((json) => json as LNUrlPay)
}

export const invoiceRequest = (callback: string, amount: number): string => {
  const nonce = Math.floor(Math.random() * 2e8)
  const finalAmount = satToMsat(amount)
  const separator = callback.includes("?") ? "&" : "?"

  const request = `${callback}${separator}amount=${finalAmount}&nonce=${nonce}`

  return request
}

export const lnUrlPay = async (
  invoice: string,
  amount: number,
  callbackFn: Function,
): Promise<void> => {
  try {
    const request = await parseUrl(invoice)
    const { tag, minSendable, maxSendable, callback } = request

    if (!isProtocolSupported(tag)) {
      throw new Error("LNURL protocol not supported")
    }

    if (!isAmountValid(amount, minSendable, maxSendable)) {
      throw new Error(`Amount must be between ${minSendable} and ${maxSendable}`)
    }

    const invoiceUrl = invoiceRequest(callback, amount)

    fetch(invoiceUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "ERROR") {
          throw new Error("Error while requesting lnurl invoice")
        }

        const memo = `LNURL payment`
        // invoice, amount, memo
        callbackFn({ invoice: data.pr })
      })
  } catch (error) {
    console.log(error)
  }
}
