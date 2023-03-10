import { WalletCurrency } from "@app/graphql/generated"
import {
  ConvertMoneyAmount,
  GetFeeParams,
  PaymentDetail,
  SendPaymentParams,
} from "@app/screens/send-bitcoin-screen/payment-details"

export const convertMoneyAmountMock: ConvertMoneyAmount = (amount, currency) => {
  return {
    amount: amount.amount,
    currency,
  }
}

export const zeroAmount = {
  amount: 0,
  currency: WalletCurrency.Btc,
}

export const btcTestAmount = {
  amount: 1232,
  currency: WalletCurrency.Btc,
}

export const usdTestAmount = {
  amount: 3212,
  currency: WalletCurrency.Usd,
}

export const testAmount = {
  amount: 100,
  currency: WalletCurrency.Btc,
}

export const btcSendingWalletDescriptor = {
  currency: WalletCurrency.Btc,
  id: "testwallet",
}

export const usdSendingWalletDescriptor = {
  currency: WalletCurrency.Usd,
  id: "testwallet",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CreateFunctionWithSpyParams<T extends (...args: any) => any> = {
  spy: jest.SpyInstance<ReturnType<T>, Parameters<T>>
  defaultParams: Parameters<T>
  creatorFunction: T
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CreateFunctionWithSpy = <T extends (...args: any) => any>() => (
  params: CreateFunctionWithSpyParams<T>,
) => void

export const expectCannotSetAmount = (paymentDetails: PaymentDetail<WalletCurrency>) => {
  expect(paymentDetails.canSetAmount).toBeFalsy()
  expect(paymentDetails.setAmount).toBeUndefined()
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
  expect(paymentDetails.sendPayment).toBeUndefined()
}

export const getTestSetMemo: CreateFunctionWithSpy = () => (params) => {
  const { defaultParams, creatorFunction, spy } = params
  const senderSpecifiedMemo = "sender memo"
  const paymentDetails = creatorFunction(defaultParams)

  if (!paymentDetails.canSetMemo) throw new Error("Memo is unable to be set")
  paymentDetails.setMemo(senderSpecifiedMemo)

  const lastCall = spy.mock.lastCall && spy.mock.lastCall[0]
  expect(lastCall).toEqual({ ...defaultParams, senderSpecifiedMemo })
}

export const getTestSetAmount: CreateFunctionWithSpy = () => (params) => {
  const { defaultParams, creatorFunction, spy } = params
  const paymentDetails = creatorFunction(defaultParams)
  const unitOfAccountAmount = {
    amount: 100,
    currency: WalletCurrency.Btc,
  }
  if (!paymentDetails.canSetAmount) throw new Error("Amount is unable to be set")
  paymentDetails.setAmount(unitOfAccountAmount)
  const lastCall = spy.mock.lastCall && spy.mock.lastCall[0]
  expect(lastCall).toEqual({ ...defaultParams, unitOfAccountAmount })
}

export const getTestSetSendingWalletDescriptor: CreateFunctionWithSpy =
  () => (params) => {
    const { defaultParams, creatorFunction, spy } = params
    const paymentDetails = creatorFunction(defaultParams)
    const sendingWalletDescriptor = {
      currency: WalletCurrency.Btc,
      id: "newtestwallet",
    }
    paymentDetails.setSendingWalletDescriptor(sendingWalletDescriptor)
    const lastCall = spy.mock.lastCall && spy.mock.lastCall[0]
    expect(lastCall).toEqual({ ...defaultParams, sendingWalletDescriptor })
  }

export const createGetFeeMocks = (): GetFeeParams => {
  return {
    lnInvoiceFeeProbe: jest.fn(),
    lnUsdInvoiceFeeProbe: jest.fn(),
    lnNoAmountInvoiceFeeProbe: jest.fn(),
    lnNoAmountUsdInvoiceFeeProbe: jest.fn(),
    onChainTxFee: jest.fn(),
  }
}

export const createSendPaymentMocks = (): SendPaymentParams => {
  return {
    lnInvoicePaymentSend: jest.fn(),
    lnNoAmountInvoicePaymentSend: jest.fn(),
    lnNoAmountUsdInvoicePaymentSend: jest.fn(),
    onChainPaymentSend: jest.fn(),
    intraLedgerPaymentSend: jest.fn(),
    intraLedgerUsdPaymentSend: jest.fn(),
  }
}
