import { Invoice, GetFullUriInput } from "./index.types"

const prefixByType = {
  [Invoice.OnChain]: "bitcoin:",
  [Invoice.Lightning]: "lightning:",
  [Invoice.PayCode]: "paycode:",
}

export const getPaymentRequestFullUri = ({
  input,
  amount,
  memo,
  uppercase = false,
  prefix = true,
  type = Invoice.OnChain,
}: GetFullUriInput): string => {
  if (type === Invoice.Lightning) {
    return uppercase ? input.toUpperCase() : input
  }

  const uriPrefix = prefix ? prefixByType[type] : ""
  const uri = `${uriPrefix}${input}`
  const params = new URLSearchParams()

  if (amount) params.append("amount", `${satsToBTC(amount)}`)

  if (memo) {
    params.append("message", encodeURI(memo))
    return `${uri}?${params.toString()}`
  }

  return uri + (params.toString() ? "?" + params.toString() : "")
}

export const satsToBTC = (satsAmount: number): number => satsAmount / 10 ** 8

export const getDefaultMemo = (bankName: string) => {
  return `Pay to ${bankName} Wallet user`
}

export const secondsToHMS = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  const hDisplay = h > 0 ? h + "h" : ""
  const mDisplay = m > 0 ? m + "m" : ""
  const sDisplay = s > 0 ? s + "s" : ""

  return hDisplay + mDisplay + sDisplay
}
