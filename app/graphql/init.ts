export const initQuery = {
  me: {
    id: "guest",
    defaultAccount: {
      id: "BTC",
      defaultWalletId: "BTC",
      wallets: [
        {
          __typename: "Wallet",
          id: "BTC",
          walletCurrency: "BTC",
          balance: 0,
        },
      ],
    },
  },
}
