import { WalletCurrency } from "@app/graphql/generated"
import {
  PaymentDetail,
  CreateLnurlPaymentDetailsParams,
} from "@app/screens/send-bitcoin-screen/payment-details"
import { createMock } from "ts-auto-mock"

const mockCreateLnurlPaymentDetail = jest.fn<
  PaymentDetail<WalletCurrency>,
  [CreateLnurlPaymentDetailsParams<WalletCurrency>]
>()

jest.mock("@app/screens/send-bitcoin-screen/payment-details", () => {
  return {
    createLnurlPaymentDetails: mockCreateLnurlPaymentDetail,
  }
})
import { createLnurlPaymentDestination } from "@app/screens/send-bitcoin-screen/payment-destination"
import { LnUrlPayServiceResponse } from "lnurl-pay/dist/types/types"
import { defaultPaymentDetailParams } from "./helpers"

describe("create lnurl destination", () => {
  it("correctly creates payment detail", () => {
    const lnurlPaymentDestinationParams = {
      paymentType: "lnurl",
      valid: true,
      lnurl: "testlnurl",
      lnurlParams: createMock<LnUrlPayServiceResponse>(),
    } as const

    const lnurlPayDestination = createLnurlPaymentDestination(
      lnurlPaymentDestinationParams,
    )

    lnurlPayDestination.createPaymentDetail(defaultPaymentDetailParams)

    expect(mockCreateLnurlPaymentDetail).toBeCalledWith({
      lnurl: lnurlPaymentDestinationParams.lnurl,
      lnurlParams: lnurlPaymentDestinationParams.lnurlParams,
      unitOfAccountAmount: {
        amount: 0,
        currency: defaultPaymentDetailParams.unitOfAccount,
      },
      convertPaymentAmount: defaultPaymentDetailParams.convertPaymentAmount,
      sendingWalletDescriptor: defaultPaymentDetailParams.sendingWalletDescriptor,
      destinationSpecifiedMemo: lnurlPaymentDestinationParams.lnurlParams.metadataHash,
    })
  })
})
