import { WalletCurrency } from "@app/graphql/generated"
import { MoneyAmount, WalletOrDisplayCurrency } from "@app/types/amounts"

import {
  BaseCreatePaymentRequestCreationDataParams,
  Invoice,
} from "@app/screens/receive-bitcoin-screen/payment/index.types"

export const btcWalletDescriptor = {
  id: "btc-wallet-id",
  currency: WalletCurrency.Btc,
}
export const usdWalletDescriptor = {
  id: "usd-wallet-id",
  currency: WalletCurrency.Usd,
}
export const convertMoneyAmountFn = <T extends WalletOrDisplayCurrency>(
  amount: MoneyAmount<WalletOrDisplayCurrency>,
  toCurrency: T,
): MoneyAmount<T> => {
  return { amount: amount.amount, currency: toCurrency, currencyCode: toCurrency }
}
export const defaultParams: BaseCreatePaymentRequestCreationDataParams<WalletCurrency> = {
  type: Invoice.Lightning,
  defaultWalletDescriptor: btcWalletDescriptor,
  bitcoinWalletDescriptor: btcWalletDescriptor,
  convertMoneyAmount: convertMoneyAmountFn,
  network: "mainnet",
  posUrl: "pos-url",
  lnAddressHostname: "ln-addr-host",
}
