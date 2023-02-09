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
import { createMock } from "ts-auto-mock"

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
import {
  createLnurlPaymentDestination,
  createLightningDestination,
  createIntraLedgerDestination,
  createOnchainDestination,
} from "@app/screens/send-bitcoin-screen/payment-destination"
import { LnUrlPayServiceResponse } from "lnurl-pay/dist/types/types"
import { defaultPaymentDetailParams } from "./helpers"

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
        paymentRequestAmount: {
          amount: parsedLightningDestinationWithAmount.amount,
          currency: WalletCurrency.Btc,
        },
        convertPaymentAmount: defaultPaymentDetailParams.convertPaymentAmount,
        destinationSpecifiedMemo: parsedLightningDestinationWithAmount.memo,
        sendingWalletDescriptor: defaultPaymentDetailParams.sendingWalletDescriptor,
        unitOfAccount: defaultPaymentDetailParams.unitOfAccount,
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
        unitOfAccountAmount: {
          amount: 0,
          currency: defaultPaymentDetailParams.unitOfAccount,
        },
        convertPaymentAmount: defaultPaymentDetailParams.convertPaymentAmount,
        destinationSpecifiedMemo: parsedLightningDestinationWithoutAmount.memo,
        sendingWalletDescriptor: defaultPaymentDetailParams.sendingWalletDescriptor,
      })
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
        destinationSpecifiedAmount: {
          amount: parsedOnchainDestinationWithAmount.amount,
          currency: WalletCurrency.Btc,
        },
        convertPaymentAmount: defaultPaymentDetailParams.convertPaymentAmount,
        sendingWalletDescriptor: defaultPaymentDetailParams.sendingWalletDescriptor,
        unitOfAccount: defaultPaymentDetailParams.unitOfAccount,
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
        unitOfAccountAmount: {
          amount: 0,
          currency: defaultPaymentDetailParams.unitOfAccount,
        },
        convertPaymentAmount: defaultPaymentDetailParams.convertPaymentAmount,
        sendingWalletDescriptor: defaultPaymentDetailParams.sendingWalletDescriptor,
        destinationSpecifiedMemo: parsedOnchainDestinationWithoutAmount.memo,
      })
    })
  })
})

describe("create intraledger destination", () => {
  const createIntraLedgerDestinationParams = {
    parsedIntraledgerDestination: {
      paymentType: "intraledger",
      handle: "testaddress",
    },
    walletId: "testwalletid",
  } as const

  it("correctly creates payment detail", () => {
    const intraLedgerDestination = createIntraLedgerDestination(
      createIntraLedgerDestinationParams,
    )
    intraLedgerDestination.createPaymentDetail(defaultPaymentDetailParams)

    expect(mockCreateIntraledgerPaymentDetail).toBeCalledWith({
      handle: createIntraLedgerDestinationParams.parsedIntraledgerDestination.handle,
      recipientWalletId: createIntraLedgerDestinationParams.walletId,
      sendingWalletDescriptor: defaultPaymentDetailParams.sendingWalletDescriptor,
      convertPaymentAmount: defaultPaymentDetailParams.convertPaymentAmount,
      unitOfAccountAmount: {
        amount: 0,
        currency: defaultPaymentDetailParams.unitOfAccount,
      },
    })
  })
})
