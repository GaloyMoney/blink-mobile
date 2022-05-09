export const TYPE_BITCOIN_ONCHAIN = "BITCOIN_ONCHAIN"
export const TYPE_LIGHTNING_BTC = "LIGHTNING_BTC"
export const TYPE_LIGHTNING_USD = "LIGHTNING_USD"

const prefixByType = {
  [TYPE_BITCOIN_ONCHAIN]: "bitcoin:",
}

export const getFullUri = ({
  input,
  amount,
  memo,
  uppercase = false,
  prefix = true,
  type = TYPE_BITCOIN_ONCHAIN,
}: GetFullUriInput): string => {
  if (type === TYPE_LIGHTNING_BTC) {
    // TODO add lightning:
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
