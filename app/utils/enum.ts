export enum AccountType {
  Bank = "Cash Account",
  Bitcoin = "Bitcoin Wallet",
  VirtualBitcoin = "Bitcoin Rewards",
  BankAndBitcoin = "BankAndBitcoin",
  BankAndVirtualBitcoin = "All", // TODO find better naming
}

export enum CurrencyType {
  USD = "USD",
  BTC = "BTC",
}

export enum FirstChannelStatus {
  pending = "pending",
  opened = "opened",
  noChannel = "noChannel",
}
