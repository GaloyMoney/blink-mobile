import React from "react"

import { WalletCurrency } from "@app/graphql/generated"
import { ConvertPaymentAmount } from "@app/screens/receive-bitcoin-screen/payment-requests/index.types"
import SendBitcoinConfirmationScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-confirmation-screen"
import { render } from "@testing-library/react-native"
import * as PaymentDetails from "../../app/screens/send-bitcoin-screen/payment-details/intraledger"
import { Wrapping } from "./helper"

const btcSendingWalletDescriptor = {
  currency: WalletCurrency.Usd,
  id: "testwallet",
}

const convertPaymentAmountMock: ConvertPaymentAmount = (amount, currency) => {
  return {
    amount: amount.amount,
    currency,
  }
}

const testAmount = {
  amount: 100,
  currency: WalletCurrency.Usd,
}

const defaultParams: PaymentDetails.CreateIntraledgerPaymentDetailsParams<WalletCurrency> =
  {
    handle: "test",
    recipientWalletId: "testid",
    convertPaymentAmount: convertPaymentAmountMock,
    sendingWalletDescriptor: btcSendingWalletDescriptor,
    unitOfAccountAmount: testAmount,
  }

const { createIntraledgerPaymentDetails } = PaymentDetails
const paymentDetail = createIntraledgerPaymentDetails(defaultParams)

const sendBitcoinConfirmation = {
  key: "sendBitcoinConfirmationScreen",
  name: "sendBitcoinConfirmation",
  params: {
    paymentDetail,
  },
} as const

it("SendScreen Confirmation", () => {
  render(
    <Wrapping>
      <SendBitcoinConfirmationScreen route={sendBitcoinConfirmation} />
    </Wrapping>,
  )
})
