import {
  AccountDefaultWalletLazyQueryHookResult,
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
  accountDefaultWalletQuery: AccountDefaultWalletLazyQueryHookResult[0]
  myWalletIds: string[]
}

export const resolveIntraledgerDestination = async ({
  parsedIntraledgerDestination,
  accountDefaultWalletQuery,
  myWalletIds,
}: ResolveIntraledgerDestinationParams): Promise<ParseDestinationResult> => {
  const { handle } = parsedIntraledgerDestination

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
  accountDefaultWalletQuery: AccountDefaultWalletLazyQueryHookResult[0],
) => {
  const { data } = await accountDefaultWalletQuery({ variables: { username } })
  return data?.accountDefaultWallet?.id
}
