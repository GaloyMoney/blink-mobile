import { WalletCurrency } from "@app/graphql/generated"
import {
  PaymentDetail,
  CreateAmountLightningPaymentDetailsParams,
  CreateNoAmountLightningPaymentDetailsParams,
} from "@app/screens/send-bitcoin-screen/payment-details"

const mockCreateAmountLightningPaymentDetail = jest.fn<
  PaymentDetail<WalletCurrency>,
  [CreateAmountLightningPaymentDetailsParams<WalletCurrency>]
>()
const mockCreateNoAmountLightningPaymentDetail = jest.fn<
  PaymentDetail<WalletCurrency>,
  [CreateNoAmountLightningPaymentDetailsParams<WalletCurrency>]
>()

jest.mock("@app/screens/send-bitcoin-screen/payment-details", () => {
  return {
    createAmountLightningPaymentDetails: mockCreateAmountLightningPaymentDetail,
    createNoAmountLightningPaymentDetails: mockCreateNoAmountLightningPaymentDetail,
  }
})
import { createLightningDestination } from "@app/screens/send-bitcoin-screen/payment-destination"
import { defaultPaymentDetailParams } from "./helpers"
import { ZeroBtcMoneyAmount, toBtcMoneyAmount } from "@app/types/amounts"

describe("create lightning destination", () => {
  const baseParsedLightningDestination = {
    paymentType: "lightning",
    valid: true,
    paymentRequest: "testinvoice",
    memo: "testmemo",
  } as const

  describe("with amount", () => {
    const parsedLightningDestinationWithAmount = {
      ...baseParsedLightningDestination,
      amount: 1000,
    } as const
    it("correctly creates payment detail", () => {
      const amountLightningDestination = createLightningDestination(
        parsedLightningDestinationWithAmount,
      )

      amountLightningDestination.createPaymentDetail(defaultPaymentDetailParams)

      expect(mockCreateAmountLightningPaymentDetail).toBeCalledWith({
        paymentRequest: parsedLightningDestinationWithAmount.paymentRequest,
        paymentRequestAmount: toBtcMoneyAmount(
          parsedLightningDestinationWithAmount.amount,
        ),
        convertMoneyAmount: defaultPaymentDetailParams.convertMoneyAmount,
        destinationSpecifiedMemo: parsedLightningDestinationWithAmount.memo,
        sendingWalletDescriptor: defaultPaymentDetailParams.sendingWalletDescriptor,
      })
    })
  })

  describe("without amount", () => {
    const parsedLightningDestinationWithoutAmount = {
      ...baseParsedLightningDestination,
    } as const
    it("correctly creates payment detail", () => {
      const noAmountLightningDestination = createLightningDestination(
        parsedLightningDestinationWithoutAmount,
      )
      noAmountLightningDestination.createPaymentDetail(defaultPaymentDetailParams)
      expect(mockCreateNoAmountLightningPaymentDetail).toBeCalledWith({
        paymentRequest: parsedLightningDestinationWithoutAmount.paymentRequest,
        unitOfAccountAmount: ZeroBtcMoneyAmount,
        convertMoneyAmount: defaultPaymentDetailParams.convertMoneyAmount,
        destinationSpecifiedMemo: parsedLightningDestinationWithoutAmount.memo,
        sendingWalletDescriptor: defaultPaymentDetailParams.sendingWalletDescriptor,
      })
    })
  })
})
