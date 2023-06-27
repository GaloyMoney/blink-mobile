import { Wallet, WalletCurrency } from "@app/graphql/generated"

type WalletBalance = Pick<Wallet, "id" | "walletCurrency" | "balance">

export const getBtcWallet = (wallets: readonly WalletBalance[] | undefined) => {
  if (wallets === undefined || wallets.length === 0) {
    return undefined
  }

  return wallets.find((wallet) => wallet.walletCurrency === WalletCurrency.Btc)
}

export const getUsdWallet = (wallets: readonly WalletBalance[] | undefined) => {
  if (wallets === undefined || wallets.length === 0) {
    return undefined
  }

  return wallets.find((wallet) => wallet.walletCurrency === WalletCurrency.Usd)
}
