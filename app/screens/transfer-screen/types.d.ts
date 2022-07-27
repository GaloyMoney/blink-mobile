type TransferScreenProps = {
  fromWallet: Wallet
  setFromWallet: (wallet: Wallet) => void
  toWallet: Wallet
  setToWallet: (wallet: Wallet) => void
  satAmount: number
  setSatAmount: (amount: number) => void
  satAmountInUsd: number
  setSatAmountInUsd: (amount: number) => void
  dollarAmount: number
  setDollarAmount: (amount: number) => void
  amountCurrency: string
  setAmountCurrency: (currency: string) => void
  nextStep: () => void
}

type TransferConfirmationScreenProps = {
  fromWallet: Wallet
  toWallet: Wallet
  satAmount: number
  satAmountInUsd: number
  dollarAmount: number
  amountCurrency: string
  nextStep: () => void
}
