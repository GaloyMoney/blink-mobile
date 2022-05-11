type GetFullUriInput = {
  input: string
  amount?: number
  memo?: string
  uppercase?: boolean
  prefix?: boolean
  type?: "BITCOIN_ONCHAIN" | "LIGHTNING_BTC" | "LIGHTNING_USD"
}
