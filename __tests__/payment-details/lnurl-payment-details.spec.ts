import { LnUrlPayServiceResponse, Satoshis } from "lnurl-pay/dist/types/types"
import { createMock } from "ts-auto-mock"

import { WalletCurrency } from "@app/graphql/generated"
import * as PaymentDetails from "@app/screens/send-bitcoin-screen/payment-details/lightning"

import {
  btcSendingWalletDescriptor,
  btcTestAmount,
  convertMoneyAmountMock,
  createGetFeeMocks,
  createSendPaymentMocks,
  getTestSetAmount,
  getTestSetSendingWalletDescriptor,
  testAmount,
  usdSendingWalletDescriptor,
} from "./helpers"

const defaultParamsWithoutInvoice = {
  lnurl: "testlnurl",
  lnurlParams: createMock<LnUrlPayServiceResponse>({
    min: 1 as Satoshis,
    max: 1000 as Satoshis,
  }),
  convertMoneyAmount: convertMoneyAmountMock,
  sendingWalletDescriptor: btcSendingWalletDescriptor,
  unitOfAccountAmount: testAmount,
}

const defaultParamsWithInvoice = {
  ...defaultParamsWithoutInvoice,
  paymentRequest: "testinvoice",
  paymentRequestAmount: btcTestAmount,
}

const defaultParamsWithEqualMinMaxAmount = {
  ...defaultParamsWithoutInvoice,
  lnurlParams: createMock<LnUrlPayServiceResponse>({
    min: 100 as Satoshis,
    max: 100 as Satoshis,
  }),
}

const spy = jest.spyOn(PaymentDetails, "createLnurlPaymentDetails")

describe("lnurl payment details", () => {
  const { createLnurlPaymentDetails } = PaymentDetails

  beforeEach(() => {
    spy.mockClear()
  })

  it("properly sets fields if min and max amount is equal", () => {
    const paymentDetails = createLnurlPaymentDetails(defaultParamsWithEqualMinMaxAmount)
    expect(paymentDetails).toEqual(
      expect.objectContaining({
        destination: defaultParamsWithEqualMinMaxAmount.lnurl,
        settlementAmount: defaultParamsWithEqualMinMaxAmount.unitOfAccountAmount,
        unitOfAccountAmount: defaultParamsWithEqualMinMaxAmount.unitOfAccountAmount,
        sendingWalletDescriptor:
          defaultParamsWithEqualMinMaxAmount.sendingWalletDescriptor,
        settlementAmountIsEstimated:
          defaultParamsWithEqualMinMaxAmount.sendingWalletDescriptor.currency !==
          WalletCurrency.Btc,
        canGetFee: false,
        canSendPayment: false,
        canSetAmount: false,
        canSetMemo: true,
        convertMoneyAmount: defaultParamsWithoutInvoice.convertMoneyAmount,
      }),
    )
  })

  it("properly sets fields without invoice", () => {
    const paymentDetails = createLnurlPaymentDetails(defaultParamsWithoutInvoice)
    expect(paymentDetails).toEqual(
      expect.objectContaining({
        destination: defaultParamsWithoutInvoice.lnurl,
        settlementAmount: defaultParamsWithoutInvoice.unitOfAccountAmount,
        unitOfAccountAmount: defaultParamsWithoutInvoice.unitOfAccountAmount,
        sendingWalletDescriptor: defaultParamsWithoutInvoice.sendingWalletDescriptor,
        canGetFee: false,
        settlementAmountIsEstimated:
          defaultParamsWithInvoice.sendingWalletDescriptor.currency !==
          WalletCurrency.Btc,
        canSendPayment: false,
        canSetAmount: true,
        canSetMemo: true,
        convertMoneyAmount: defaultParamsWithoutInvoice.convertMoneyAmount,
      }),
    )
  })

  it("properly sets fields with invoice set", () => {
    const paymentDetails = createLnurlPaymentDetails(defaultParamsWithInvoice)
    expect(paymentDetails).toEqual(
      expect.objectContaining({
        destination: defaultParamsWithInvoice.lnurl,
        settlementAmount: defaultParamsWithInvoice.paymentRequestAmount,
        unitOfAccountAmount: defaultParamsWithInvoice.unitOfAccountAmount,
        sendingWalletDescriptor: defaultParamsWithInvoice.sendingWalletDescriptor,
        settlementAmountIsEstimated:
          defaultParamsWithInvoice.sendingWalletDescriptor.currency !==
          WalletCurrency.Btc,
        canGetFee: true,
        canSendPayment: true,
        canSetAmount: true,
        canSetMemo: true,
        convertMoneyAmount: defaultParamsWithoutInvoice.convertMoneyAmount,
      }),
    )
  })

  describe("sending from a btc wallet", () => {
    const btcSendingWalletParams = {
      ...defaultParamsWithInvoice,
      sendingWalletDescriptor: btcSendingWalletDescriptor,
    }
    const paymentDetails = createLnurlPaymentDetails(btcSendingWalletParams)

    it("uses the correct fee mutations and args", async () => {
      const feeParamsMocks = createGetFeeMocks()
      if (!paymentDetails.canGetFee) {
        throw new Error("Cannot get fee")
      }

      try {
        await paymentDetails.getFee(feeParamsMocks)
      } catch {
        // do nothing as function is expected to throw since we are not mocking the fee response
      }

      expect(feeParamsMocks.lnInvoiceFeeProbe).toHaveBeenCalledWith({
        variables: {
          input: {
            paymentRequest: btcSendingWalletParams.paymentRequest,
            walletId: btcSendingWalletParams.sendingWalletDescriptor.id,
          },
        },
      })
    })

    it("uses the correct send payment mutation and args", async () => {
      const sendPaymentMocks = createSendPaymentMocks()
      if (!paymentDetails.canSendPayment) {
        throw new Error("Cannot send payment")
      }

      try {
        await paymentDetails.sendPaymentMutation(sendPaymentMocks)
      } catch {
        // do nothing as function is expected to throw since we are not mocking the send payment response
      }

      expect(sendPaymentMocks.lnInvoicePaymentSend).toHaveBeenCalledWith({
        variables: {
          input: {
            paymentRequest: btcSendingWalletParams.paymentRequest,
            walletId: btcSendingWalletParams.sendingWalletDescriptor.id,
          },
        },
      })
    })
  })

  describe("sending from a usd wallet", () => {
    const usdSendingWalletParams = {
      ...defaultParamsWithInvoice,
      sendingWalletDescriptor: usdSendingWalletDescriptor,
    }
    const paymentDetails = createLnurlPaymentDetails(usdSendingWalletParams)

    it("uses the correct fee mutations and args", async () => {
      const feeParamsMocks = createGetFeeMocks()
      if (!paymentDetails.canGetFee) {
        throw new Error("Cannot get fee")
      }

      try {
        await paymentDetails.getFee(feeParamsMocks)
      } catch {
        // do nothing as function is expected to throw since we are not mocking the fee response
      }

      expect(feeParamsMocks.lnUsdInvoiceFeeProbe).toHaveBeenCalledWith({
        variables: {
          input: {
            paymentRequest: usdSendingWalletParams.paymentRequest,
            walletId: usdSendingWalletParams.sendingWalletDescriptor.id,
          },
        },
      })
    })

    it("uses the correct send payment mutation and args", async () => {
      const sendPaymentMocks = createSendPaymentMocks()
      if (!paymentDetails.canSendPayment) {
        throw new Error("Cannot send payment")
      }

      try {
        await paymentDetails.sendPaymentMutation(sendPaymentMocks)
      } catch {
        // do nothing as function is expected to throw since we are not mocking the send payment response
      }

      expect(sendPaymentMocks.lnInvoicePaymentSend).toHaveBeenCalledWith({
        variables: {
          input: {
            paymentRequest: usdSendingWalletParams.paymentRequest,
            walletId: usdSendingWalletParams.sendingWalletDescriptor.id,
          },
        },
      })
    })
  })

  it("can set amount", () => {
    const testSetAmount = getTestSetAmount()
    testSetAmount({
      defaultParams: defaultParamsWithoutInvoice,
      spy,
      creatorFunction: createLnurlPaymentDetails,
    })
  })

  it("can set sending wallet descriptor", () => {
    const testSetSendingWalletDescriptor = getTestSetSendingWalletDescriptor()
    testSetSendingWalletDescriptor({
      defaultParams: defaultParamsWithoutInvoice,
      spy,
      creatorFunction: createLnurlPaymentDetails,
    })
  })
})
