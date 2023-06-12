import { createLnurlPaymentDetails } from "@app/screens/send-bitcoin-screen/payment-details"
import { createMock } from "ts-auto-mock"

import {
  createLnurlPaymentDestination,
  resolveLnurlDestination,
} from "@app/screens/send-bitcoin-screen/payment-destination"
import { DestinationDirection } from "@app/screens/send-bitcoin-screen/payment-destination/index.types"
import { ZeroBtcMoneyAmount } from "@app/types/amounts"
import { PaymentType, fetchLnurlPaymentParams } from "@galoymoney/client"
import { LNURLPayParams, LNURLResponse, LNURLWithdrawParams, getParams } from "js-lnurl"
import { LnUrlPayServiceResponse } from "lnurl-pay/dist/types/types"
import { defaultPaymentDetailParams } from "./helpers"

jest.mock("@galoymoney/client", () => {
  const actualModule = jest.requireActual("@galoymoney/client")

  return {
    ...actualModule,
    fetchLnurlPaymentParams: jest.fn(),
  }
})

jest.mock("js-lnurl", () => {
  return {
    getParams: jest.fn(),
  }
})
jest.mock("@app/screens/send-bitcoin-screen/payment-details", () => {
  return {
    createLnurlPaymentDetails: jest.fn(),
  }
})

const mockFetchLnurlPaymentParams = fetchLnurlPaymentParams as jest.MockedFunction<
  typeof fetchLnurlPaymentParams
>
const mockGetParams = getParams as jest.MockedFunction<typeof getParams>
const mockCreateLnurlPaymentDetail = createLnurlPaymentDetails as jest.MockedFunction<
  typeof createLnurlPaymentDetails
>

const throwError = () => {
  throw new Error("test error")
}

describe("resolve lnurl destination", () => {
  describe("with ln address", () => {
    const lnurlPaymentDestinationParams = {
      parsedLnurlDestination: {
        paymentType: PaymentType.Lnurl,
        valid: true,
        lnurl: "test@domain.com",
      } as const,
      lnurlDomains: ["ourdomain.com"],
      accountDefaultWalletQuery: jest.fn(),
      myWalletIds: ["testwalletid"],
    }

    it("creates lnurl pay destination", async () => {
      const lnurlPayParams = createMock<LnUrlPayServiceResponse>({
        identifier: lnurlPaymentDestinationParams.parsedLnurlDestination.lnurl,
      })
      mockFetchLnurlPaymentParams.mockResolvedValue(lnurlPayParams)
      mockGetParams.mockResolvedValue(createMock<LNURLResponse>())

      const destination = await resolveLnurlDestination(lnurlPaymentDestinationParams)

      expect(destination).toEqual(
        expect.objectContaining({
          valid: true,
          destinationDirection: DestinationDirection.Send,
          validDestination: {
            ...lnurlPaymentDestinationParams.parsedLnurlDestination,
            lnurlParams: lnurlPayParams,
            valid: true,
          },
        }),
      )
    })
  })

  describe("with lnurl pay string", () => {
    const lnurlPaymentDestinationParams = {
      parsedLnurlDestination: {
        paymentType: PaymentType.Lnurl,
        valid: true,
        lnurl: "lnurlrandomstring",
      } as const,
      lnurlDomains: ["ourdomain.com"],
      accountDefaultWalletQuery: jest.fn(),
      myWalletIds: ["testwalletid"],
    }

    it("creates lnurl pay destination", async () => {
      const lnurlPayParams = createMock<LnUrlPayServiceResponse>({
        identifier: lnurlPaymentDestinationParams.parsedLnurlDestination.lnurl,
      })
      mockFetchLnurlPaymentParams.mockResolvedValue(lnurlPayParams)
      mockGetParams.mockResolvedValue(createMock<LNURLPayParams>())

      const destination = await resolveLnurlDestination(lnurlPaymentDestinationParams)

      expect(destination).toEqual(
        expect.objectContaining({
          valid: true,
          destinationDirection: DestinationDirection.Send,
          validDestination: {
            ...lnurlPaymentDestinationParams.parsedLnurlDestination,
            lnurlParams: lnurlPayParams,
            valid: true,
          },
        }),
      )
    })
  })

  describe("with lnurl withdraw string", () => {
    const lnurlPaymentDestinationParams = {
      parsedLnurlDestination: {
        paymentType: PaymentType.Lnurl,
        valid: true,
        lnurl: "lnurlrandomstring",
      } as const,
      lnurlDomains: ["ourdomain.com"],
      accountDefaultWalletQuery: jest.fn(),
      myWalletIds: ["testwalletid"],
    }

    it("creates lnurl withdraw destination", async () => {
      mockFetchLnurlPaymentParams.mockImplementation(throwError)
      const mockLnurlWithdrawParams = createMock<LNURLWithdrawParams>()
      mockGetParams.mockResolvedValue(mockLnurlWithdrawParams)

      const destination = await resolveLnurlDestination(lnurlPaymentDestinationParams)

      const {
        callback,
        domain,
        k1,
        maxWithdrawable,
        minWithdrawable,
        defaultDescription,
      } = mockLnurlWithdrawParams

      expect(destination).toEqual(
        expect.objectContaining({
          valid: true,
          destinationDirection: DestinationDirection.Receive,
          validDestination: {
            paymentType: PaymentType.Lnurl,
            callback,
            domain,
            k1,
            maxWithdrawable,
            minWithdrawable,
            defaultDescription,
            valid: true,
            lnurl: lnurlPaymentDestinationParams.parsedLnurlDestination.lnurl,
          },
        }),
      )
    })
  })
})

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
      unitOfAccountAmount: ZeroBtcMoneyAmount,
      convertMoneyAmount: defaultPaymentDetailParams.convertMoneyAmount,
      sendingWalletDescriptor: defaultPaymentDetailParams.sendingWalletDescriptor,
      destinationSpecifiedMemo: lnurlPaymentDestinationParams.lnurlParams.description,
    })
  })
})
