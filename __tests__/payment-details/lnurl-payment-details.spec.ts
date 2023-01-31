import { WalletCurrency } from "@app/graphql/generated"
import * as PaymentDetails from "@app/screens/send-bitcoin-screen/payment-details/lightning-payment-details"
import { testAmount, btcSendingWalletDescriptor, convertPaymentAmountMock, createGetFeeMocks, createSendPaymentMocks, expectCannotGetFee, expectCannotSendPayment, expectDestinationSpecifiedMemoCannotSetMemo, getTestSetAmount, getTestSetMemo, getTestSetSendingWalletDescriptor, usdSendingWalletDescriptor, zeroAmount, btcTestAmount } from "./helpers"
import { createMock } from "ts-auto-mock"
import { LnUrlPayServiceResponse } from "lnurl-pay/dist/types/types"

const defaultParamsWithoutInvoice = {
    lnurl: "testlnurl",
    lnurlParams: createMock<LnUrlPayServiceResponse>(),
    convertPaymentAmount: convertPaymentAmountMock,
    sendingWalletDescriptor: btcSendingWalletDescriptor,
    unitOfAccountAmount: testAmount,
}

const defaultParamsWithInvoice = {
    ...defaultParamsWithoutInvoice,
    paymentRequest: "testinvoice",
    paymentRequestAmount: btcTestAmount,
}

const spy = jest.spyOn(PaymentDetails, "createLnurlPaymentDetails")

describe("lnurl payment details", () => {

    const {
        createLnurlPaymentDetails,
    } = PaymentDetails

    beforeEach(() => {
        spy.mockClear()
    })

    it("properly sets fields without invoice", () => {
        const paymentDetails = createLnurlPaymentDetails(defaultParamsWithoutInvoice)
        expect(paymentDetails).toEqual(expect.objectContaining({
            destination: defaultParamsWithoutInvoice.lnurl,
            settlementAmount: defaultParamsWithoutInvoice.convertPaymentAmount(defaultParamsWithoutInvoice.unitOfAccountAmount, defaultParamsWithoutInvoice.sendingWalletDescriptor.currency),
            unitOfAccountAmount: defaultParamsWithoutInvoice.unitOfAccountAmount,
            sendingWalletDescriptor: defaultParamsWithoutInvoice.sendingWalletDescriptor,
            canGetFee: false,
            settlementAmountIsEstimated: defaultParamsWithInvoice.sendingWalletDescriptor.currency !== WalletCurrency.Btc,
            canSendPayment: false,
            canSetAmount: true,
            canSetMemo: true,
            convertPaymentAmount: defaultParamsWithoutInvoice.convertPaymentAmount,
        }))
    })

    it("properly sets fields with invoice set", () => {
        const paymentDetails = createLnurlPaymentDetails(defaultParamsWithInvoice)
        expect(paymentDetails).toEqual(expect.objectContaining({
            destination: defaultParamsWithInvoice.lnurl,
            destinationSpecifiedAmount: defaultParamsWithInvoice.paymentRequestAmount,
            settlementAmount: defaultParamsWithInvoice.convertPaymentAmount(defaultParamsWithInvoice.paymentRequestAmount, defaultParamsWithInvoice.sendingWalletDescriptor.currency),
            unitOfAccountAmount: defaultParamsWithInvoice.convertPaymentAmount(defaultParamsWithInvoice.paymentRequestAmount, defaultParamsWithInvoice.sendingWalletDescriptor.currency),
            sendingWalletDescriptor: defaultParamsWithInvoice.sendingWalletDescriptor,
            settlementAmountIsEstimated: defaultParamsWithInvoice.sendingWalletDescriptor.currency !== WalletCurrency.Btc,
            canGetFee: true,
            canSendPayment: true,
            canSetAmount: true,
            canSetMemo: true,
            convertPaymentAmount: defaultParamsWithoutInvoice.convertPaymentAmount,
        }))
    })

    describe("sending from a btc wallet", () => {
        const btcSendingWalletParams = {
            ...defaultParamsWithInvoice,
            sendingWalletDescriptor: btcSendingWalletDescriptor
        }
        const paymentDetails = createLnurlPaymentDetails(btcSendingWalletParams)

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

            expect(feeParamsMocks.lnInvoiceFeeProbe).toHaveBeenCalledWith({
                variables: {
                    input: {
                        paymentRequest: btcSendingWalletParams.paymentRequest,
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

            expect(sendPaymentMocks.lnInvoicePaymentSend).toHaveBeenCalledWith({
                variables: {
                    input: {
                        paymentRequest: btcSendingWalletParams.paymentRequest,
                        walletId: btcSendingWalletParams.sendingWalletDescriptor.id
                    }
                }
            })
        })
    })

    describe("sending from a usd wallet", () => {
        const usdSendingWalletParams = {
            ...defaultParamsWithInvoice,
            sendingWalletDescriptor: usdSendingWalletDescriptor
        }
        const paymentDetails = createLnurlPaymentDetails(usdSendingWalletParams)

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

            expect(feeParamsMocks.lnUsdInvoiceFeeProbe).toHaveBeenCalledWith({
                variables: {
                    input: {
                        paymentRequest: usdSendingWalletParams.paymentRequest,
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

            expect(sendPaymentMocks.lnInvoicePaymentSend).toHaveBeenCalledWith({
                variables: {
                    input: {
                        paymentRequest: usdSendingWalletParams.paymentRequest,
                        walletId: usdSendingWalletParams.sendingWalletDescriptor.id
                    }
                }
            })
        })
    })

    it("cannot set memo if memo is provided", () => {
        const paramsWithMemo = {
            ...defaultParamsWithoutInvoice,
            destinationSpecifiedMemo: "sender memo"
        }
        const paymentDetails = createLnurlPaymentDetails(paramsWithMemo)
        expectDestinationSpecifiedMemoCannotSetMemo(paymentDetails, paramsWithMemo.destinationSpecifiedMemo)
    })

    it("can set memo if no memo provided", () => {
        const testSetMemo = getTestSetMemo()
        testSetMemo({
            defaultParams: defaultParamsWithoutInvoice,
            spy,
            creatorFunction: createLnurlPaymentDetails,
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
