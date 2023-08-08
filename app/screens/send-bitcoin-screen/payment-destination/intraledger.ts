import {
  AccountDefaultWalletLazyQueryHookResult,
  WalletCurrency,
} from "@app/graphql/generated"
import { IntraledgerPaymentDestination } from "@galoymoney/client"
import { createIntraledgerPaymentDetails } from "../payment-details"
import {
  CreatePaymentDetailParams,
  DestinationDirection,
  InvalidDestinationReason,
  ParseDestinationResult,
  PaymentDestination,
} from "./index.types"
import { ZeroBtcMoneyAmount } from "@app/types/amounts"

export type ResolveIntraledgerDestinationParams = {
  parsedIntraledgerDestination: IntraledgerPaymentDestination
  accountDefaultWalletQuery: AccountDefaultWalletLazyQueryHookResult[0]
  myWalletIds: string[]
}

export const resolveIntraledgerDestination = async ({
  parsedIntraledgerDestination,
  accountDefaultWalletQuery,
  myWalletIds,
}: ResolveIntraledgerDestinationParams): Promise<ParseDestinationResult> => {
  const { valid, handle } = parsedIntraledgerDestination

  if (!valid) {
    return {
      valid: false,
      invalidReason: InvalidDestinationReason.WrongDomain,
      invalidPaymentDestination: parsedIntraledgerDestination,
    }
  }

  const handleWalletId = await getUserWalletId(handle, accountDefaultWalletQuery)

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
    convertMoneyAmount,
    sendingWalletDescriptor,
  }: CreatePaymentDetailParams<T>) => {
    return createIntraledgerPaymentDetails({
      handle,
      recipientWalletId: walletId,
      sendingWalletDescriptor,
      convertMoneyAmount,
      unitOfAccountAmount: ZeroBtcMoneyAmount,
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
  accountDefaultWalletQuery: AccountDefaultWalletLazyQueryHookResult[0],
) => {
  const { data } = await accountDefaultWalletQuery({ variables: { username } })
  return data?.accountDefaultWallet?.id
}
