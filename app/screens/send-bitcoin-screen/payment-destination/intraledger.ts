import {
  UserDefaultWalletIdLazyQueryHookResult,
  WalletCurrency,
} from "@app/graphql/generated"
import { IntraledgerPaymentDestination } from "@galoymoney/client/dist/parsing-v2"
import { createIntraledgerPaymentDetails } from "../payment-details"
import {
  CreatePaymentDetailParams,
  DestinationDirection,
  InvalidDestinationReason,
  ParseDestinationResult,
  PaymentDestination,
} from "./index.types"

export type ResolveIntraledgerDestinationParams = {
  parsedIntraledgerDestination: IntraledgerPaymentDestination
  userDefaultWalletIdQuery: UserDefaultWalletIdLazyQueryHookResult[0]
  myWalletIds: string[]
}

export const resolveIntraledgerDestination = async ({
  parsedIntraledgerDestination,
  userDefaultWalletIdQuery,
  myWalletIds,
}: ResolveIntraledgerDestinationParams): Promise<ParseDestinationResult> => {
  const { handle } = parsedIntraledgerDestination

  const handleWalletId = await getUserWalletId(handle, userDefaultWalletIdQuery)

  if (!handleWalletId) {
    return {
      valid: false,
      invalidReason: InvalidDestinationReason.UsernameDoesNotExist,
      invalidPaymentDestination: parsedIntraledgerDestination,
    } as const
  }

  if (myWalletIds.includes(handleWalletId)) {
    return {
      valid: false,
      invalidReason: InvalidDestinationReason.SelfPayment,
      invalidPaymentDestination: parsedIntraledgerDestination,
    } as const
  }

  return createIntraLedgerDestination({
    parsedIntraledgerDestination,
    walletId: handleWalletId,
  })
}

export type CreateIntraLedgerDestinationParams = {
  parsedIntraledgerDestination: IntraledgerPaymentDestination
  walletId: string
}

export const createIntraLedgerDestination = (
  params: CreateIntraLedgerDestinationParams,
): PaymentDestination => {
  const {
    parsedIntraledgerDestination: { handle },
    walletId,
  } = params

  const createPaymentDetail = <T extends WalletCurrency>({
    convertPaymentAmount,
    sendingWalletDescriptor,
  }: CreatePaymentDetailParams<T>) => {
    return createIntraledgerPaymentDetails({
      handle,
      recipientWalletId: walletId,
      sendingWalletDescriptor,
      convertPaymentAmount,
      unitOfAccountAmount: {
        amount: 0,
        currency: WalletCurrency.Btc,
      },
    })
  }

  return {
    valid: true,
    createPaymentDetail,
    destinationDirection: DestinationDirection.Send,
    validDestination: { ...params.parsedIntraledgerDestination, walletId, valid: true },
  }
}

const getUserWalletId = async (
  username: string,
  userDefaultWalletIdQuery: UserDefaultWalletIdLazyQueryHookResult[0],
) => {
  const { data } = await userDefaultWalletIdQuery({ variables: { username } })
  return data?.userDefaultWalletId
}
