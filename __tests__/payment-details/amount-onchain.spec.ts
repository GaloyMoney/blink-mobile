import { WalletCurrency } from "@app/graphql/generated"
import * as PaymentDetails from "@app/screens/send-bitcoin-screen/payment-details/onchain"
import {
  btcSendingWalletDescriptor,
  convertMoneyAmountMock,
  createGetFeeMocks,
  createSendPaymentMocks,
  expectDestinationSpecifiedMemoCannotSetMemo,
  getTestSetMemo,
  getTestSetSendingWalletDescriptor,
  testAmount,
  usdSendingWalletDescriptor,
} from "./helpers"

const defaultParams: PaymentDetails.CreateAmountOnchainPaymentDetailsParams<WalletCurrency> =
  {
    address: "testaddress",
    destinationSpecifiedAmount: testAmount,
    convertMoneyAmount: convertMoneyAmountMock,
    sendingWalletDescriptor: btcSendingWalletDescriptor,
  }

const spy = jest.spyOn(PaymentDetails, "createAmountOnchainPaymentDetails")

describe("no amount lightning payment details", () => {
  const { createAmountOnchainPaymentDetails } = PaymentDetails

  beforeEach(() => {
    spy.mockClear()
  })

  it("properly sets fields with all arguments provided", () => {
    const paymentDetails = createAmountOnchainPaymentDetails(defaultParams)
    expect(paymentDetails).toEqual(
      expect.objectContaining({
        destination: defaultParams.address,
        settlementAmount: defaultParams.convertMoneyAmount(
          defaultParams.destinationSpecifiedAmount,
          defaultParams.sendingWalletDescriptor.currency,
        ),
        unitOfAccountAmount: defaultParams.destinationSpecifiedAmount,
        sendingWalletDescriptor: defaultParams.sendingWalletDescriptor,
        settlementAmountIsEstimated: false,
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
      unitOfAccountAmount: testAmount,
      sendingWalletDescriptor: btcSendingWalletDescriptor,
    }
    const paymentDetails = createAmountOnchainPaymentDetails(btcSendingWalletParams)
    const settlementAmount = defaultParams.convertMoneyAmount(
      testAmount,
      btcSendingWalletDescriptor.currency,
    )

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

      expect(feeParamsMocks.onChainTxFee).toHaveBeenCalledWith({
        variables: {
          address: defaultParams.address,
          amount: settlementAmount.amount,
          walletId: btcSendingWalletParams.sendingWalletDescriptor.id,
        },
      })
    })

    it("uses the correct send payment mutation and args", async () => {
      const sendPaymentMocks = createSendPaymentMocks()
      if (!paymentDetails.canSendPayment) {
        throw new Error("Cannot send payment")
      }

      try {
        await paymentDetails.sendPayment(sendPaymentMocks)
      } catch {
        // do nothing as function is expected to throw since we are not mocking the send payment response
      }

      expect(sendPaymentMocks.onChainPaymentSend).toHaveBeenCalledWith({
        variables: {
          input: {
            address: defaultParams.address,
            amount: settlementAmount.amount,
            walletId: btcSendingWalletParams.sendingWalletDescriptor.id,
          },
        },
      })
    })
  })

  describe("sending from a usd wallet", () => {
    it("throws an error", () => {
      const usdSendingWalletParams = {
        ...defaultParams,
        unitOfAccountAmount: testAmount,
        sendingWalletDescriptor: usdSendingWalletDescriptor,
      }
      expect(() => createAmountOnchainPaymentDetails(usdSendingWalletParams)).toThrow()
    })
  })

  it("cannot set memo if memo is provided", () => {
    const paramsWithMemo = {
      ...defaultParams,
      destinationSpecifiedMemo: "sender memo",
    }
    const paymentDetails = createAmountOnchainPaymentDetails(paramsWithMemo)
    expectDestinationSpecifiedMemoCannotSetMemo(
      paymentDetails,
      paramsWithMemo.destinationSpecifiedMemo,
    )
  })

  it("can set memo if no memo provided", () => {
    const testSetMemo = getTestSetMemo()
    testSetMemo({
      defaultParams,
      spy,
      creatorFunction: createAmountOnchainPaymentDetails,
    })
  })

  it("can set sending wallet descriptor", () => {
    const testSetSendingWalletDescriptor = getTestSetSendingWalletDescriptor()
    testSetSendingWalletDescriptor({
      defaultParams,
      spy,
      creatorFunction: createAmountOnchainPaymentDetails,
    })
  })
})
