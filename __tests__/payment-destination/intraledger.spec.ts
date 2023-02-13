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

describe("resolve intraledger", () => {
  const defaultIntraledgerParams = {
    parsedIntraledgerDestination: {
      paymentType: "intraledger",
      handle: "testhandle",
    } as const,
    userDefaultWalletIdQuery: jest.fn(),
    myWalletIds: ["testwalletid"],
  }

  it("returns invalid destination if wallet is not found", async () => {
    defaultIntraledgerParams.userDefaultWalletIdQuery.mockResolvedValue({ data: {} })
    const destination = await resolveIntraledgerDestination(defaultIntraledgerParams)

    expect(destination).toEqual({
      valid: false,
      invalidReason: InvalidDestinationReason.UsernameDoesNotExist,
      invalidPaymentDestination: defaultIntraledgerParams.parsedIntraledgerDestination,
    })
  })

  it("returns invalid destination if user is owned by self", async () => {
    defaultIntraledgerParams.userDefaultWalletIdQuery.mockResolvedValue({
      data: { userDefaultWalletId: "testwalletid" },
    })
    const destination = await resolveIntraledgerDestination(defaultIntraledgerParams)

    expect(destination).toEqual({
      valid: false,
      invalidReason: InvalidDestinationReason.SelfPayment,
      invalidPaymentDestination: defaultIntraledgerParams.parsedIntraledgerDestination,
    })
  })

  it("returns a valid destination if username exists", async () => {
    defaultIntraledgerParams.userDefaultWalletIdQuery.mockResolvedValue({
      data: { userDefaultWalletId: "successwalletid" },
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
