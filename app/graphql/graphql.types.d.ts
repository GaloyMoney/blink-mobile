type SettlementPrice = {
  formattedAmount: string
  base: number
  offset: number
  currencyUnit: string
}

type TransactionType = "IntraLedgerTransaction" | "LnTransaction" | "OnChainTransaction"

type WalletTransaction = {
  readonly __typename: TransactionType
  readonly id: string
  readonly walletId: string | null
  readonly initiationVia: "intraledger" | "onchain" | "lightning"
  readonly settlementVia: "intraledger" | "onchain" | "lightning"
  readonly settlementAmount: number
  readonly settlementFee: number
  readonly settlementUsdPerSat: number
  readonly settlementPrice: SettlementPrice
  readonly otherPartyUsername: string | null
  readonly addresses: string[] | null
  readonly paymentHash: string | null
  readonly status: string
  readonly direction: "SEND" | "RECEIVE"
  readonly memo: string | null
  readonly createdAt: number
}
