import { WalletCurrency } from "@app/graphql/generated"

export const defaultPaymentDetailParams = {
  convertPaymentAmount: jest.fn(),
  sendingWalletDescriptor: {
    currency: WalletCurrency.Btc,
    id: "testid",
  },
  unitOfAccount: WalletCurrency.Usd,
}
