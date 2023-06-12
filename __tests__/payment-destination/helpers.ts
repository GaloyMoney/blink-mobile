import { WalletCurrency } from "@app/graphql/generated"

export const defaultPaymentDetailParams = {
  convertMoneyAmount: jest.fn(),
  sendingWalletDescriptor: {
    currency: WalletCurrency.Btc,
    id: "testid",
  },
}
