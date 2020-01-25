export enum AccountType {
    Bank = "Bank Account",
    Bitcoin = "Bitcoin Wallet",
    All = "All",
  }
  
export enum CurrencyType {
    USD = "USD",
    BTC = "BTC",
}

export enum PendingOpenChannelsStatus {
  pending = "pending",
  opened = "opened",
  noChannel = "noChannel",
}

export enum Onboarding {
  channelCreated = "channelCreated",
  walletOnboarded = "walletOnboarded",
  bankOnboarded = "bankOnboarded",
}