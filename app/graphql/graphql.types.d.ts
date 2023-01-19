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
