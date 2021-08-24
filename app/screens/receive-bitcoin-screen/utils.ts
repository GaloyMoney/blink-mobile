const TYPE_BITCOIN = "bitcoin"
const TYPE_LIGHTNING = "lightning"

const prefixByType = {
  [TYPE_BITCOIN]: "bitcoin:",
}

export const getFullUri = ({
  input,
  amount,
  memo,
  uppercase = false,
  prefix = true,
  type = TYPE_BITCOIN,
}: GetFullUriInput): string => {
  if (type === TYPE_LIGHTNING) {
    // TODO add lightning:
    return uppercase ? input.toUpperCase() : input
  }

  const uriPrefix = prefix ? prefixByType[type] : ""
  const uri = `${uriPrefix}${input}`
  const params = new URLSearchParams()

  if (amount) params.append("amount", `${amount / 10 ** 8}`)

  if (memo) {
    params.append("message", encodeURI(memo))
    return `${uri}?${params.toString()}`
  }

  return params.toString() ? `${uri}?${params.toString()}` : `${uri}`
}
