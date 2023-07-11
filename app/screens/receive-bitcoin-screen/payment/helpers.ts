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
