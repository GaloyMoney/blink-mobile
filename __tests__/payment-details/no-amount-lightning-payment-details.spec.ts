import { WalletCurrency } from "@app/graphql/generated"
import * as PaymentDetails from "@app/screens/send-bitcoin-screen/payment-details/lightning-payment-details"
import { testAmount, btcSendingWalletDescriptor, convertPaymentAmountMock, createGetFeeMocks, createSendPaymentMocks, expectCannotGetFee, expectCannotSendPayment, expectDestinationSpecifiedMemoCannotSetMemo, getTestSetAmount, getTestSetMemo, getTestSetSendingWalletDescriptor, usdSendingWalletDescriptor, zeroAmount } from "./helpers"

const defaultParams: PaymentDetails.CreateNoAmountLightningPaymentDetailsParams<WalletCurrency> = {
    paymentRequest: "testinvoice",
    convertPaymentAmount: convertPaymentAmountMock,
    sendingWalletDescriptor: btcSendingWalletDescriptor,
    unitOfAccountAmount: testAmount,
}

const spy = jest.spyOn(PaymentDetails, "createNoAmountLightningPaymentDetails")

describe("no amount lightning payment details", () => {

    const {
        createNoAmountLightningPaymentDetails,
    } = PaymentDetails

    beforeEach(() => {
        spy.mockClear()
    })

    it("properly sets fields with all arguments provided", () => {
        
        const paymentDetails = createNoAmountLightningPaymentDetails(defaultParams)
        expect(paymentDetails).toEqual(expect.objectContaining({
            destination: defaultParams.paymentRequest,
            settlementAmount: defaultParams.convertPaymentAmount(defaultParams.unitOfAccountAmount, defaultParams.sendingWalletDescriptor.currency),
            unitOfAccountAmount: defaultParams.unitOfAccountAmount,
            sendingWalletDescriptor: defaultParams.sendingWalletDescriptor,
            settlementAmountIsEstimated: false,
            canGetFee: true,
            canSendPayment: true,
            canSetAmount: true,
            canSetMemo: true,
            convertPaymentAmount: defaultParams.convertPaymentAmount,
        }))
    })

    describe("sending from a btc wallet", () => {
        const btcSendingWalletParams = {
            ...defaultParams,
            unitOfAccountAmount: testAmount,
            sendingWalletDescriptor: btcSendingWalletDescriptor
        }
        const paymentDetails = createNoAmountLightningPaymentDetails(btcSendingWalletParams)
        const settlementAmount = defaultParams.convertPaymentAmount(testAmount, btcSendingWalletDescriptor.currency)

        it("uses the correct fee mutations and args", async () => {
            const feeParamsMocks = createGetFeeMocks()
            if (!paymentDetails.canGetFee) {
                throw new Error("Cannot get fee")
            }

            try {
                await paymentDetails.getFee(feeParamsMocks)
            }
            catch {
                // do nothing as function is expected to throw since we are not mocking the fee response
            }

            expect(feeParamsMocks.lnNoAmountInvoiceFeeProbe).toHaveBeenCalledWith({
                variables: {
                    input: {
                        paymentRequest: defaultParams.paymentRequest,
                        amount: settlementAmount.amount,
                        walletId: btcSendingWalletParams.sendingWalletDescriptor.id
                    }
                }

            })
        })

        it("uses the correct send payment mutation and args", async () => {
            const sendPaymentMocks = createSendPaymentMocks()
            if (!paymentDetails.canSendPayment) {
                throw new Error("Cannot send payment")
            }

            try {
                await paymentDetails.sendPayment(sendPaymentMocks)
            }
            catch {
                // do nothing as function is expected to throw since we are not mocking the send payment response
            }

            expect(sendPaymentMocks.lnNoAmountInvoicePaymentSend).toHaveBeenCalledWith({
                variables: {
                    input: {
                        paymentRequest: defaultParams.paymentRequest,
                        amount: settlementAmount.amount,
                        walletId: btcSendingWalletParams.sendingWalletDescriptor.id
                    }
                }
            })
        })
    })

    describe("sending from a usd wallet", () => {
        const usdSendingWalletParams = {
            ...defaultParams,
            unitOfAccountAmount: testAmount,
            sendingWalletDescriptor: usdSendingWalletDescriptor
        }
        const settlementAmount = defaultParams.convertPaymentAmount(testAmount, usdSendingWalletDescriptor.currency)
        const paymentDetails = createNoAmountLightningPaymentDetails(usdSendingWalletParams)

        it("uses the correct fee mutations and args", async () => {
            const feeParamsMocks = createGetFeeMocks()
            if (!paymentDetails.canGetFee) {
                throw new Error("Cannot get fee")
            }

            try {
                await paymentDetails.getFee(feeParamsMocks)
            }
            catch {
                // do nothing as function is expected to throw since we are not mocking the fee response
            }

            expect(feeParamsMocks.lnNoAmountUsdInvoiceFeeProbe).toHaveBeenCalledWith({
                variables: {
                    input: {
                        paymentRequest: defaultParams.paymentRequest,
                        amount: settlementAmount.amount,
                        walletId: usdSendingWalletParams.sendingWalletDescriptor.id
                    }
                }

            })
        })

        it("uses the correct send payment mutation and args", async () => {
            const sendPaymentMocks = createSendPaymentMocks()
            if (!paymentDetails.canSendPayment) {
                throw new Error("Cannot send payment")
            }

            try {
                await paymentDetails.sendPayment(sendPaymentMocks)
            }
            catch {
                // do nothing as function is expected to throw since we are not mocking the send payment response
            }

            expect(sendPaymentMocks.lnNoAmountUsdInvoicePaymentSend).toHaveBeenCalledWith({
                variables: {
                    input: {
                        paymentRequest: defaultParams.paymentRequest,
                        amount: settlementAmount.amount,
                        walletId: usdSendingWalletParams.sendingWalletDescriptor.id
                    }
                }
            })
        })
    })

    it("cannot calculate fee or send payment with zero amount", () => {
        const params: PaymentDetails.CreateNoAmountLightningPaymentDetailsParams<WalletCurrency> = {
            ...defaultParams,
            unitOfAccountAmount: zeroAmount
        }
        const paymentDetails = createNoAmountLightningPaymentDetails(params)
        expectCannotGetFee(paymentDetails)
        expectCannotSendPayment(paymentDetails)
    })

    it("cannot set memo if memo is provided", () => {
        const paramsWithMemo = {
            ...defaultParams,
            destinationSpecifiedMemo: "sender memo"
        }
        const paymentDetails = createNoAmountLightningPaymentDetails(paramsWithMemo)
        expectDestinationSpecifiedMemoCannotSetMemo(paymentDetails, paramsWithMemo.destinationSpecifiedMemo)
    })

    it("can set memo if no memo provided", () => {
        const testSetMemo = getTestSetMemo()
        testSetMemo({
            defaultParams,
            spy,
            creatorFunction: createNoAmountLightningPaymentDetails,
        })
    })

    it("can set amount", () => {
        const testSetAmount = getTestSetAmount()
        testSetAmount({
            defaultParams,
            spy,
            creatorFunction: createNoAmountLightningPaymentDetails,
        })
    })

    it("can set sending wallet descriptor", () => {
        const testSetSendingWalletDescriptor = getTestSetSendingWalletDescriptor()
        testSetSendingWalletDescriptor({
            defaultParams,
            spy,
            creatorFunction: createNoAmountLightningPaymentDetails,
        })
    })
})
