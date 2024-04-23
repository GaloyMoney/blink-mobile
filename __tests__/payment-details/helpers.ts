import { WalletCurrency } from "@app/graphql/generated"
import {
  ConvertMoneyAmount,
  GetFeeParams,
  PaymentDetail,
  SendPaymentMutationParams,
} from "@app/screens/send-bitcoin-screen/payment-details"
import {
  ZeroBtcMoneyAmount,
  toBtcMoneyAmount,
  toUsdMoneyAmount,
} from "@app/types/amounts"

export const convertMoneyAmountMock: ConvertMoneyAmount = (amount, currency) => {
  return {
    amount: amount.amount,
    currency,
    currencyCode: currency,
  }
}

export const zeroAmount = ZeroBtcMoneyAmount

export const btcTestAmount = toBtcMoneyAmount(1232)

export const usdTestAmount = toUsdMoneyAmount(3212)

export const testAmount = toBtcMoneyAmount(100)

export const btcSendingWalletDescriptor = {
  currency: WalletCurrency.Btc,
  id: "testwallet",
}

export const usdSendingWalletDescriptor = {
  currency: WalletCurrency.Usd,
  id: "testwallet",
}

export const expectDestinationSpecifiedMemoCannotSetMemo = <T extends WalletCurrency>(
  paymentDetails: PaymentDetail<T>,
  destinationSpecifiedMemo: string,
) => {
  expect(paymentDetails.canSetMemo).toBeFalsy()
  expect(paymentDetails.setMemo).toBeUndefined()
  expect(paymentDetails.memo).toEqual(destinationSpecifiedMemo)
}

export const expectCannotGetFee = (paymentDetails: PaymentDetail<WalletCurrency>) => {
  expect(paymentDetails.canGetFee).toBeFalsy()
  expect(paymentDetails.getFee).toBeUndefined()
}

export const expectCannotSendPayment = (
  paymentDetails: PaymentDetail<WalletCurrency>,
) => {
  expect(paymentDetails.canSendPayment).toBeFalsy()
  expect(paymentDetails.sendPaymentMutation).toBeUndefined()
}

export const createGetFeeMocks = (): GetFeeParams => {
  return {
    lnInvoiceFeeProbe: jest.fn(),
    lnUsdInvoiceFeeProbe: jest.fn(),
    lnNoAmountInvoiceFeeProbe: jest.fn(),
    lnNoAmountUsdInvoiceFeeProbe: jest.fn(),
    onChainTxFee: jest.fn(),
    onChainUsdTxFee: jest.fn(),
    onChainUsdTxFeeAsBtcDenominated: jest.fn(),
  }
}

export const createSendPaymentMocks = (): SendPaymentMutationParams => {
  return {
    lnInvoicePaymentSend: jest.fn(),
    lnNoAmountInvoicePaymentSend: jest.fn(),
    lnNoAmountUsdInvoicePaymentSend: jest.fn(),
    onChainPaymentSend: jest.fn(),
    onChainUsdPaymentSend: jest.fn(),
    onChainPaymentSendAll: jest.fn(),
    onChainUsdPaymentSendAsBtcDenominated: jest.fn(),
    intraLedgerPaymentSend: jest.fn(),
    intraLedgerUsdPaymentSend: jest.fn(),
  }
}
