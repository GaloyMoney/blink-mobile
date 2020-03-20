import I18n from "i18n-js"
import { OnboardingRewards } from "types"


import {
  Linking,
} from "react-native"

/**
 * Convert bytes to a hex encoded string
 * @param  {Buffer|Uint8Array} buf The input as bytes or base64 string
 * @return {string}            The output as hex
 */
export const toHex = buf => {
  if (!Buffer.isBuffer(buf) && !(buf instanceof Uint8Array)) {
    throw new Error("Invalid input!")
  }
  return Buffer.from(buf).toString("hex")
}

export const shortenHash = (hash: string, length = 4) => {
  return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`
}

export const emailIsValid = email => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const capitalize = s => {
  if (typeof s !== "string") return ""
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// TODO fix link for mainnet
export const showFundingTx = (fundingTx) => {
  Linking.openURL(`https://blockstream.info/testnet/tx/${fundingTx}`).catch(err =>
    console.error("Couldn't load page", err),
  )
}

export const plusSats = balance =>
`+${I18n.t("sat", {
  count: balance,
  formatted_number: I18n.toNumber(balance, { precision: 0 }),
})}`