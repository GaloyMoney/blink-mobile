import { LazyQueryExecFunction } from "@apollo/client"
import { Exact, UserDefaultWalletIdQuery, WalletCurrency } from "@app/graphql/generated"
import { fetchLnurlPaymentParams } from "@galoymoney/client"
import { LnurlPaymentDestination, PaymentType } from "@galoymoney/client/dist/parsing-v2"
import crashlytics from "@react-native-firebase/crashlytics"
import { getParams, LNURLPayParams } from "js-lnurl"
import { createLnurlPaymentDetails } from "../payment-details"
import {
  CreatePaymentDetailParams,
  DestinationDirection,
  InvalidDestinationReason,
  ResolvedLnurlPaymentDestination,
  ReceiveDestination,
  PaymentDestination,
  ParseDestinationResult,
} from "./index.types"
import { resolveIntraledgerDestination } from "./intraledger"

export type ResolveLnurlDestinationParams = {
  parsedLnurlDestination: LnurlPaymentDestination
  lnurlDomains: string[]
  userDefaultWalletIdQuery: LazyQueryExecFunction<
    UserDefaultWalletIdQuery,
    Exact<{
      username: string
    }>
  >
  myWalletIds: string[]
}

export const resolveLnurlDestination = async ({
  parsedLnurlDestination,
  lnurlDomains,
  userDefaultWalletIdQuery,
  myWalletIds,
}: ResolveLnurlDestinationParams): Promise<ParseDestinationResult> => {
  if (parsedLnurlDestination.valid) {
    try {
      const lnurlParams = await getParams(parsedLnurlDestination.lnurl)
      if ("reason" in lnurlParams) {
        throw lnurlParams.reason
      }

      switch (lnurlParams.tag) {
        case "payRequest": {
          const maybeIntraledgerDestination = await tryGetIntraLedgerDestinationFromLnurl(
            {
              lnurlDomains,
              lnurlParams,
              myWalletIds,
              userDefaultWalletIdQuery,
            },
          )

          if (maybeIntraledgerDestination && maybeIntraledgerDestination.valid) {
            return maybeIntraledgerDestination
          }

          const lnurlPayParams = await fetchLnurlPaymentParams({
            lnUrlOrAddress: parsedLnurlDestination.lnurl,
          })

          return createLnurlPaymentDestination({
            lnurlParams: lnurlPayParams,
            ...parsedLnurlDestination,
          })
        }

        case "withdrawRequest": {
          return createLnurlWithdrawDestination({
            lnurl: parsedLnurlDestination.lnurl,
            callback: lnurlParams.callback,
            domain: lnurlParams.domain,
            k1: lnurlParams.k1,
            defaultDescription: lnurlParams.defaultDescription,
            minWithdrawable: lnurlParams.minWithdrawable,
            maxWithdrawable: lnurlParams.maxWithdrawable,
          })
        }

        default:
          return {
            valid: false,
            invalidReason: InvalidDestinationReason.LnurlUnsupported,
            invalidPaymentDestination: parsedLnurlDestination,
          } as const
      }
    } catch (err) {
      if (err instanceof Error) {
        crashlytics().recordError(err)
      }
    }
  }

  return {
    valid: false,
    invalidReason: InvalidDestinationReason.LnurlError,
    invalidPaymentDestination: parsedLnurlDestination,
  } as const
}

type tryGetIntraLedgerDestinationFromLnurlParams = {
  lnurlParams: LNURLPayParams
  lnurlDomains: string[]
  userDefaultWalletIdQuery: LazyQueryExecFunction<
    UserDefaultWalletIdQuery,
    Exact<{
      username: string
    }>
  >
  myWalletIds: string[]
}

const tryGetIntraLedgerDestinationFromLnurl = ({
  lnurlParams,
  lnurlDomains,
  userDefaultWalletIdQuery,
  myWalletIds,
}: tryGetIntraLedgerDestinationFromLnurlParams) => {
  const intraLedgerHandleFromLnurl = getIntraLedgerHandleIfLnurlIsOurOwn({
    lnurlParams,
    lnurlDomains,
  })

  if (intraLedgerHandleFromLnurl) {
    return resolveIntraledgerDestination({
      parsedIntraledgerDestination: {
        paymentType: PaymentType.Intraledger,
        handle: intraLedgerHandleFromLnurl,
      },
      userDefaultWalletIdQuery,
      myWalletIds,
    })
  }

  return undefined
}

const getIntraLedgerHandleIfLnurlIsOurOwn = ({
  lnurlParams,
  lnurlDomains,
}: {
  lnurlParams: LNURLPayParams
  lnurlDomains: string[]
}) => {
  if (lnurlParams.domain && lnurlDomains.includes(lnurlParams.domain)) {
    if ("decodedMetadata" in lnurlParams) {
      const lnAddressMetadata = lnurlParams.decodedMetadata.find(
        (metadata) => metadata[0] === "text/identifier",
      )
      if (lnAddressMetadata && lnAddressMetadata[1]) {
        return lnAddressMetadata[1].split("@")[0]
      }
    }
  }
  return undefined
}

export const createLnurlPaymentDestination = (
  resolvedLnurlPaymentDestination: ResolvedLnurlPaymentDestination & { valid: true },
): PaymentDestination => {
  const createPaymentDetail = <T extends WalletCurrency>({
    convertPaymentAmount,
    sendingWalletDescriptor,
    unitOfAccount,
  }: CreatePaymentDetailParams<T>) => {
    return createLnurlPaymentDetails({
      lnurl: resolvedLnurlPaymentDestination.lnurl,
      lnurlParams: resolvedLnurlPaymentDestination.lnurlParams,
      sendingWalletDescriptor,
      destinationSpecifiedMemo: resolvedLnurlPaymentDestination.lnurlParams.metadataHash,
      convertPaymentAmount,
      unitOfAccountAmount: {
        amount: 0,
        currency: unitOfAccount,
      },
    })
  }
  return {
    valid: true,
    destinationDirection: DestinationDirection.Send,
    validDestination: resolvedLnurlPaymentDestination,
    createPaymentDetail,
  } as const
}

export type CreateLnurlWithdrawDestinationParams = {
  lnurl: string
  callback: string
  domain: string
  k1: string
  defaultDescription: string
  minWithdrawable: number
  maxWithdrawable: number
}

export const createLnurlWithdrawDestination = (
  params: CreateLnurlWithdrawDestinationParams,
): ReceiveDestination => {
  return {
    valid: true,
    destinationDirection: DestinationDirection.Receive,
    validDestination: {
      ...params,
      valid: true,
    },
  } as const
}
