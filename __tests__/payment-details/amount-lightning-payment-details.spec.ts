import { WalletCurrency } from "@app/graphql/generated"
import * as PaymentDetails from "@app/screens/send-bitcoin-screen/payment-details/lightning"

import {
  btcSendingWalletDescriptor,
  btcTestAmount,
  convertMoneyAmountMock,
  createGetFeeMocks,
  createSendPaymentMocks,
  expectDestinationSpecifiedMemoCannotSetMemo,
  usdSendingWalletDescriptor,
} from "./helpers"

const defaultParams: PaymentDetails.CreateAmountLightningPaymentDetailsParams<WalletCurrency> =
  {
    paymentRequest: "testinvoice",
    paymentRequestAmount: btcTestAmount,
    convertMoneyAmount: convertMoneyAmountMock,
    sendingWalletDescriptor: btcSendingWalletDescriptor,
  }

describe("amount lightning payment details", () => {
  const { createAmountLightningPaymentDetails } = PaymentDetails

  it("properly sets fields with all arguments provided", () => {
    const paymentDetails = createAmountLightningPaymentDetails(defaultParams)
    expect(paymentDetails).toEqual(
      expect.objectContaining({
        destination: defaultParams.paymentRequest,
        destinationSpecifiedAmount: defaultParams.paymentRequestAmount,
        settlementAmount: defaultParams.convertMoneyAmount(
          defaultParams.paymentRequestAmount,
          defaultParams.sendingWalletDescriptor.currency,
        ),
        unitOfAccountAmount: defaultParams.paymentRequestAmount,
        sendingWalletDescriptor: defaultParams.sendingWalletDescriptor,
        canGetFee: true,
        canSendPayment: true,
        canSetAmount: false,
        canSetMemo: true,
        convertMoneyAmount: defaultParams.convertMoneyAmount,
      }),
    )
  })

  describe("sending from a btc wallet", () => {
    const btcSendingWalletParams = {
      ...defaultParams,
      sendingWalletDescriptor: btcSendingWalletDescriptor,
    }
    const paymentDetails = createAmountLightningPaymentDetails(btcSendingWalletParams)

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
            paymentRequest: defaultParams.paymentRequest,
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
            paymentRequest: defaultParams.paymentRequest,
            walletId: btcSendingWalletParams.sendingWalletDescriptor.id,
          },
        },
      })
    })
  })

  describe("sending from a usd wallet", () => {
    const usdSendingWalletParams = {
      ...defaultParams,
      sendingWalletDescriptor: usdSendingWalletDescriptor,
    }
    const paymentDetails = createAmountLightningPaymentDetails(usdSendingWalletParams)

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
            paymentRequest: defaultParams.paymentRequest,
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
            paymentRequest: defaultParams.paymentRequest,
            walletId: usdSendingWalletParams.sendingWalletDescriptor.id,
          },
        },
      })
    })
  })

  it("cannot set memo if memo is provided", () => {
    const defaultParamsWithMemo = {
      ...defaultParams,
      destinationSpecifiedMemo: "sender memo",
    }
    const paymentDetails = createAmountLightningPaymentDetails(defaultParamsWithMemo)
    expectDestinationSpecifiedMemoCannotSetMemo(
      paymentDetails,
      defaultParamsWithMemo.destinationSpecifiedMemo,
    )
  })

  it("can set memo if no memo provided", () => {
    const paymentDetails = createAmountLightningPaymentDetails(defaultParams)
    const senderSpecifiedMemo = "sender memo"
    if (!paymentDetails.canSetMemo) throw new Error("Memo is unable to be set")

    const newPaymentDetails = paymentDetails.setMemo(senderSpecifiedMemo)
    expect(newPaymentDetails.memo).toEqual(senderSpecifiedMemo)
  })

  it("can set sending wallet descriptor", () => {
    const paymentDetails = createAmountLightningPaymentDetails(defaultParams)
    const sendingWalletDescriptor = {
      currency: WalletCurrency.Btc,
      id: "newtestwallet",
    }
    const newPaymentDetails = paymentDetails.setSendingWalletDescriptor(
      sendingWalletDescriptor,
    )
    expect(newPaymentDetails.sendingWalletDescriptor).toEqual(sendingWalletDescriptor)
  })
})
