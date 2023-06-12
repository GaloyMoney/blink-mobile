import { WalletCurrency } from "@app/graphql/generated"
import * as PaymentDetails from "@app/screens/send-bitcoin-screen/payment-details/intraledger"
import {
  btcSendingWalletDescriptor,
  convertMoneyAmountMock,
  createSendPaymentMocks,
  expectCannotGetFee,
  expectCannotSendPayment,
  expectDestinationSpecifiedMemoCannotSetMemo,
  getTestSetAmount,
  getTestSetMemo,
  getTestSetSendingWalletDescriptor,
  testAmount,
  usdSendingWalletDescriptor,
  zeroAmount,
} from "./helpers"

const defaultParams: PaymentDetails.CreateIntraledgerPaymentDetailsParams<WalletCurrency> =
  {
    handle: "test",
    recipientWalletId: "testid",
    convertMoneyAmount: convertMoneyAmountMock,
    sendingWalletDescriptor: btcSendingWalletDescriptor,
    unitOfAccountAmount: testAmount,
  }

const spy = jest.spyOn(PaymentDetails, "createIntraledgerPaymentDetails")

describe("intraledger payment details", () => {
  const { createIntraledgerPaymentDetails } = PaymentDetails

  beforeEach(() => {
    spy.mockClear()
  })

  it("properly sets fields with all arguments provided", () => {
    const paymentDetails = createIntraledgerPaymentDetails(defaultParams)
    expect(paymentDetails).toEqual(
      expect.objectContaining({
        destination: defaultParams.handle,
        settlementAmount: defaultParams.convertMoneyAmount(
          defaultParams.unitOfAccountAmount,
          defaultParams.sendingWalletDescriptor.currency,
        ),
        unitOfAccountAmount: defaultParams.unitOfAccountAmount,
        sendingWalletDescriptor: defaultParams.sendingWalletDescriptor,
        settlementAmountIsEstimated: false,
        canGetFee: true,
        canSendPayment: true,
        canSetAmount: true,
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
    const paymentDetails = createIntraledgerPaymentDetails(btcSendingWalletParams)
    const settlementAmount = defaultParams.convertMoneyAmount(
      testAmount,
      btcSendingWalletDescriptor.currency,
    )

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

      expect(sendPaymentMocks.intraLedgerPaymentSend).toHaveBeenCalledWith({
        variables: {
          input: {
            recipientWalletId: defaultParams.recipientWalletId,
            amount: settlementAmount.amount,
            walletId: btcSendingWalletParams.sendingWalletDescriptor.id,
          },
        },
      })
    })
  })

  describe("sending from a usd wallet", () => {
    const usdSendingWalletParams = {
      ...defaultParams,
      unitOfAccountAmount: testAmount,
      sendingWalletDescriptor: usdSendingWalletDescriptor,
    }
    const settlementAmount = defaultParams.convertMoneyAmount(
      testAmount,
      usdSendingWalletDescriptor.currency,
    )
    const paymentDetails = createIntraledgerPaymentDetails(usdSendingWalletParams)

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

      expect(sendPaymentMocks.intraLedgerUsdPaymentSend).toHaveBeenCalledWith({
        variables: {
          input: {
            recipientWalletId: defaultParams.recipientWalletId,
            amount: settlementAmount.amount,
            walletId: usdSendingWalletParams.sendingWalletDescriptor.id,
          },
        },
      })
    })
  })

  it("cannot calculate fee or send payment with zero amount", () => {
    const paramsWithMemo = {
      ...defaultParams,
      unitOfAccountAmount: zeroAmount,
    }
    const paymentDetails = createIntraledgerPaymentDetails(paramsWithMemo)
    expectCannotGetFee(paymentDetails)
    expectCannotSendPayment(paymentDetails)
  })

  it("cannot set memo if memo is provided", () => {
    const paramsWithMemo = {
      ...defaultParams,
      destinationSpecifiedMemo: "sender memo",
    }
    const paymentDetails = createIntraledgerPaymentDetails(paramsWithMemo)
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
      creatorFunction: createIntraledgerPaymentDetails,
    })
  })

  it("can set amount", () => {
    const testSetAmount = getTestSetAmount()
    testSetAmount({
      defaultParams,
      spy,
      creatorFunction: createIntraledgerPaymentDetails,
    })
  })

  it("can set sending wallet descriptor", () => {
    const testSetSendingWalletDescriptor = getTestSetSendingWalletDescriptor()
    testSetSendingWalletDescriptor({
      defaultParams,
      spy,
      creatorFunction: createIntraledgerPaymentDetails,
    })
  })
})
