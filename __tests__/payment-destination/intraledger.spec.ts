import { WalletCurrency } from "@app/graphql/generated"
import {
  PaymentDetail,
  CreateIntraledgerPaymentDetailsParams,
} from "@app/screens/send-bitcoin-screen/payment-details"

const mockCreateIntraledgerPaymentDetail = jest.fn<
  PaymentDetail<WalletCurrency>,
  [CreateIntraledgerPaymentDetailsParams<WalletCurrency>]
>()

jest.mock("@app/screens/send-bitcoin-screen/payment-details", () => {
  return {
    createIntraledgerPaymentDetails: mockCreateIntraledgerPaymentDetail,
  }
})
import {
  createIntraLedgerDestination,
  resolveIntraledgerDestination,
} from "@app/screens/send-bitcoin-screen/payment-destination"
import { defaultPaymentDetailParams } from "./helpers"
import { InvalidDestinationReason } from "@app/screens/send-bitcoin-screen/payment-destination/index.types"
import { ZeroBtcMoneyAmount } from "@app/types/amounts"

describe("resolve intraledger", () => {
  const defaultIntraledgerParams = {
    parsedIntraledgerDestination: {
      paymentType: "intraledger",
      handle: "testhandle",
      valid: true,
    } as const,
    accountDefaultWalletQuery: jest.fn(),
    myWalletIds: ["testwalletid"],
  }

  it("returns invalid destination if wallet is not found", async () => {
    defaultIntraledgerParams.accountDefaultWalletQuery.mockResolvedValue({ data: {} })
    const destination = await resolveIntraledgerDestination(defaultIntraledgerParams)

    expect(destination).toEqual({
      valid: false,
      invalidReason: InvalidDestinationReason.UsernameDoesNotExist,
      invalidPaymentDestination: defaultIntraledgerParams.parsedIntraledgerDestination,
    })
  })

  it("returns invalid destination if user is owned by self", async () => {
    defaultIntraledgerParams.accountDefaultWalletQuery.mockResolvedValue({
      data: { accountDefaultWallet: { id: "testwalletid" } },
    })
    const destination = await resolveIntraledgerDestination(defaultIntraledgerParams)
    expect(destination).toEqual({
      valid: false,
      invalidReason: InvalidDestinationReason.SelfPayment,
      invalidPaymentDestination: defaultIntraledgerParams.parsedIntraledgerDestination,
    })
  })

  it("returns a valid destination if username exists", async () => {
    defaultIntraledgerParams.accountDefaultWalletQuery.mockResolvedValue({
      data: { accountDefaultWallet: { id: "successwalletid" } },
    })
    const destination = await resolveIntraledgerDestination(defaultIntraledgerParams)
    expect(destination).toEqual(
      expect.objectContaining({
        valid: true,
        validDestination: {
          ...defaultIntraledgerParams.parsedIntraledgerDestination,
          walletId: "successwalletid",
          valid: true,
        },
      }),
    )
  })
})

describe("create intraledger destination", () => {
  const createIntraLedgerDestinationParams = {
    parsedIntraledgerDestination: {
      paymentType: "intraledger",
      handle: "testhandle",
      valid: true,
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
      convertMoneyAmount: defaultPaymentDetailParams.convertMoneyAmount,
      unitOfAccountAmount: ZeroBtcMoneyAmount,
    })
  })
})
