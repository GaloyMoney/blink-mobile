import { WalletCurrency } from '@app/graphql/generated'
import { ConvertPaymentAmount } from '@app/screens/send-bitcoin-screen/payment-details'
import * as PaymentDetails from '@app/screens/send-bitcoin-screen/payment-details/lightning-payment-details'

const convertPaymentAmountMock: ConvertPaymentAmount = (amount, currency) => {
    return {
        amount: amount.amount,
        currency: currency
    }
}

const defaultParams: PaymentDetails.CreateNoAmountLightningPaymentDetailsParams<WalletCurrency> = {
    paymentRequest: 'testinvoice',
    convertPaymentAmount: convertPaymentAmountMock
}

const amountToSet = {
    amount: 100,
    currency: WalletCurrency.Btc
}

const btcSendingWalletDescriptor = {
    currency: WalletCurrency.Btc,
    walletId: 'testwallet'
}

const usdSendingWalletDescriptor = {
    currency: WalletCurrency.Usd,
    walletId: 'testwallet'
}

const 

const spy = jest.spyOn(PaymentDetails, 'CreateNoAmountLightningPaymentDetails')


describe("no amount lightning payment details", () => {
    const defaultPaymentDetails = PaymentDetails.CreateNoAmountLightningPaymentDetails(defaultParams)

    beforeEach(() => {
        spy.mockClear()
    })

    it('has destination set', () => {
        expect(defaultPaymentDetails).toEqual(expect.objectContaining({
            destination: defaultParams.paymentRequest,
            memo: undefined
        }))
    })

    it('cannot set memo if memo is provided', () => {

        const paymentDetails = PaymentDetails.CreateNoAmountLightningPaymentDetails(defaultParams)
        paymentDetails.setMemo!('testmemo')
        console.log(spy.mock.calls)
    })

    it('has fee and send payment defined', () => {

    })

})
