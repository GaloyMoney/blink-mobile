type SettlementPrice = {
  formattedAmount: string
  base: number
  offset?: number
  currencyUnit?: string
}

type SettlementViaType =
  | "SettlementViaIntraLedger"
  | "SettlementViaLn"
  | "SettlementViaOnChain"

type SettlementViaIntraLedger = {
  readonly __typename: "SettlementViaIntraLedger"
  readonly walletId: string | null
  readonly counterPartyUsername: string | null
}

type SettlementViaLn = {
  readonly __typename: "SettlementViaLn"
  readonly paymentHash: string
}

type SettlementViaOnChain = {
  readonly __typename: "SettlementViaOnChain"
  transactionHash: string
}

type WalletTransaction = {
  readonly __typename: "Transaction"
  readonly id: string
  readonly settlementCurrency: "BTC" | "USD"
  readonly settlementAmount: number
  readonly settlementFee: number
  readonly settlementUsdPerSat: number
  readonly settlementPrice: SettlementPrice
  readonly status: string
  readonly direction: "SEND" | "RECEIVE"
  readonly memo: string | null
  readonly createdAt: number

  readonly settlementVia:
    | SettlementViaIntraLedger
    | SettlementViaLn
    | SettlementViaOnChain

  readonly initiationVia:
    | InitiationViaIntraLedger
    | InititationViaLn
    | InitiationViaOnChain
}

type MutationError = {
  message: string
}
