export enum AccountType {
    Checking = "Checking",
    Bitcoin = "Bitcoin",
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
  phoneVerified = "phoneVerified",
  channelCreated = "channelCreated",
  walletOnboarded = "walletOnboarded",
  bankOnboarded = "bankOnboarded",
}

export type Side = "buy" | "sell"