import { bech32 } from "bech32"

import { SUPPORTED_PROTOCOLS } from "../../constants/lnurl"

import { satToMsat } from "../amount"

import { LNUrlProtocol } from "../../types/lnurl"

export const isLnUrl = (invoice: string): boolean =>
  invoice.toLowerCase().startsWith("lnurl")

export const isProtocolSupported = (tag: string): boolean => !!SUPPORTED_PROTOCOLS[tag]

export const isAmountValid = (amount: number, min: number, max: number): boolean =>
  min < amount && amount < max

export const parseUrl = async (invoice: string): Promise<LNUrlProtocol> => {
  const { words } = bech32.decode(invoice, 2000)

  const url = Buffer.from(bech32.fromWords(words)).toString()

  return fetch(url)
    .then((response) => response.json())
    .then((json) => json)
}
