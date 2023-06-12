import { WalletCurrency } from "@app/graphql/generated"
import {
  PaymentDetail,
  CreateAmountLightningPaymentDetailsParams,
  CreateNoAmountLightningPaymentDetailsParams,
  CreateLnurlPaymentDetailsParams,
  CreateNoAmountOnchainPaymentDetailsParams,
  CreateAmountOnchainPaymentDetailsParams,
  CreateIntraledgerPaymentDetailsParams,
} from "@app/screens/send-bitcoin-screen/payment-details"

const mockCreateAmountLightningPaymentDetail = jest.fn<
  PaymentDetail<WalletCurrency>,
  [CreateAmountLightningPaymentDetailsParams<WalletCurrency>]
>()
const mockCreateNoAmountLightningPaymentDetail = jest.fn<
  PaymentDetail<WalletCurrency>,
  [CreateNoAmountLightningPaymentDetailsParams<WalletCurrency>]
>()
const mockCreateLnurlPaymentDetail = jest.fn<
  PaymentDetail<WalletCurrency>,
  [CreateLnurlPaymentDetailsParams<WalletCurrency>]
>()
const mockCreateNoAmountOnchainPaymentDetail = jest.fn<
  PaymentDetail<WalletCurrency>,
  [CreateNoAmountOnchainPaymentDetailsParams<WalletCurrency>]
>()
const mockCreateAmountOnchainPaymentDetail = jest.fn<
  PaymentDetail<WalletCurrency>,
  [CreateAmountOnchainPaymentDetailsParams<WalletCurrency>]
>()
const mockCreateIntraledgerPaymentDetail = jest.fn<
  PaymentDetail<WalletCurrency>,
  [CreateIntraledgerPaymentDetailsParams<WalletCurrency>]
>()

jest.mock("@app/screens/send-bitcoin-screen/payment-details", () => {
  return {
    createAmountLightningPaymentDetails: mockCreateAmountLightningPaymentDetail,
    createNoAmountLightningPaymentDetails: mockCreateNoAmountLightningPaymentDetail,
    createLnurlPaymentDetails: mockCreateLnurlPaymentDetail,
    createNoAmountOnchainPaymentDetails: mockCreateNoAmountOnchainPaymentDetail,
    createAmountOnchainPaymentDetails: mockCreateAmountOnchainPaymentDetail,
    createIntraledgerPaymentDetails: mockCreateIntraledgerPaymentDetail,
  }
})
import { createOnchainDestination } from "@app/screens/send-bitcoin-screen/payment-destination"
import { defaultPaymentDetailParams } from "./helpers"
import { ZeroBtcMoneyAmount, toBtcMoneyAmount } from "@app/types/amounts"

describe("create onchain destination", () => {
  const baseParsedOnchainDestination = {
    paymentType: "onchain",
    valid: true,
    address: "testaddress",
    memo: "testmemo",
  } as const

  describe("with amount", () => {
    const parsedOnchainDestinationWithAmount = {
      ...baseParsedOnchainDestination,
      amount: 1000,
    } as const
    it("correctly creates payment detail", () => {
      const amountOnchainDestination = createOnchainDestination(
        parsedOnchainDestinationWithAmount,
      )

      amountOnchainDestination.createPaymentDetail(defaultPaymentDetailParams)

      expect(mockCreateAmountOnchainPaymentDetail).toBeCalledWith({
        address: parsedOnchainDestinationWithAmount.address,
        destinationSpecifiedAmount: toBtcMoneyAmount(
          parsedOnchainDestinationWithAmount.amount,
        ),
        convertMoneyAmount: defaultPaymentDetailParams.convertMoneyAmount,
        sendingWalletDescriptor: defaultPaymentDetailParams.sendingWalletDescriptor,
        destinationSpecifiedMemo: parsedOnchainDestinationWithAmount.memo,
      })
    })
  })

  describe("without amount", () => {
    const parsedOnchainDestinationWithoutAmount = {
      ...baseParsedOnchainDestination,
    } as const
    it("correctly creates payment detail", () => {
      const noAmountOnchainDestination = createOnchainDestination(
        parsedOnchainDestinationWithoutAmount,
      )
      noAmountOnchainDestination.createPaymentDetail(defaultPaymentDetailParams)
      expect(mockCreateNoAmountOnchainPaymentDetail).toBeCalledWith({
        address: parsedOnchainDestinationWithoutAmount.address,
        unitOfAccountAmount: ZeroBtcMoneyAmount,
        convertMoneyAmount: defaultPaymentDetailParams.convertMoneyAmount,
        sendingWalletDescriptor: defaultPaymentDetailParams.sendingWalletDescriptor,
        destinationSpecifiedMemo: parsedOnchainDestinationWithoutAmount.memo,
      })
    })
  })
})
