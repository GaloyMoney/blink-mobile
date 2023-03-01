import { DisplayCurrency, MoneyAmount, WalletOrDisplayCurrency } from "@app/types/amounts"
import React from "react"
import { usePriceConversion } from "../../hooks/use-price-conversion"
import { Wallet } from "@app/graphql/generated"

type WalletFragment = Pick<Wallet, "id" | "balance" | "walletCurrency">

type UseConvertMoneyDetailsParams = {
  initialFromWallet: WalletFragment
  initialToWallet: WalletFragment
}

export const useConvertMoneyDetails = (params?: UseConvertMoneyDetailsParams) => {
  const [wallets, _setWallets] = React.useState<
    | {
        fromWallet: WalletFragment
        toWallet: WalletFragment
      }
    | undefined
  >(() => {
    if (params) {
      // if the from wallet is empty, swap the wallets
      if (params.initialFromWallet.balance === 0) {
        return {
          fromWallet: params.initialToWallet,
          toWallet: params.initialFromWallet,
        }
      }
      return {
        fromWallet: params.initialFromWallet,
        toWallet: params.initialToWallet,
      }
    }
    return undefined
  })
  const [moneyAmount, setMoneyAmount] = React.useState<
    MoneyAmount<WalletOrDisplayCurrency>
  >({ amount: 0, currency: DisplayCurrency })

  const setWallets = (wallets: {
    fromWallet: WalletFragment
    toWallet: WalletFragment
  }) => {
    // if the from wallet is empty, swap the wallets
    if (wallets.fromWallet.balance === 0) {
      return _setWallets({
        fromWallet: wallets.toWallet,
        toWallet: wallets.fromWallet,
      })
    }

    _setWallets(wallets)
  }

  const { convertMoneyAmount } = usePriceConversion()

  if (!wallets || !convertMoneyAmount) {
    return {
      moneyAmount,
      setMoneyAmount,
      setWallets,
      displayAmount: undefined,
      settlementSendAmount: undefined,
      settlementReceiveAmount: undefined,
      toggleAmountCurrency: undefined,
      fromWallet: undefined,
      toWallet: undefined,
      canToggleWallet: false,
      toggleWallet: undefined,
      isValidAmount: false,
    } as const
  }

  const { fromWallet, toWallet } = wallets

  const toggleAmountCurrency = () => {
    setMoneyAmount(
      convertMoneyAmount(
        moneyAmount,
        moneyAmount.currency === DisplayCurrency
          ? fromWallet.walletCurrency
          : DisplayCurrency,
      ),
    )
  }

  const toggleWallet =
    toWallet.balance > 0
      ? ({
          canToggleWallet: true,
          toggleWallet: () => {
            setWallets({
              fromWallet: wallets.toWallet,
              toWallet: wallets.fromWallet,
            })
            setMoneyAmount(convertMoneyAmount(moneyAmount, DisplayCurrency))
          },
        } as const)
      : ({
          canToggleWallet: false,
        } as const)

  const settlementSendAmount = convertMoneyAmount(moneyAmount, fromWallet.walletCurrency)
  const settlementReceiveAmount = convertMoneyAmount(moneyAmount, toWallet.walletCurrency)

  return {
    moneyAmount,
    setMoneyAmount,
    displayAmount: convertMoneyAmount(moneyAmount, DisplayCurrency),
    setWallets,
    settlementSendAmount,
    settlementReceiveAmount,
    toggleAmountCurrency,
    fromWallet,
    toWallet,
    isValidAmount: settlementSendAmount.amount <= fromWallet.balance,
    ...toggleWallet,
  }
}
