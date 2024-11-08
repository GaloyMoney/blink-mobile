import {
  parsePaymentDestination,
  PaymentType,
  Network as NetworkGaloyClient,
} from "@flash/client"

import { ParsedPaymentDestination } from "@galoymoney/client"

import {
  InvalidDestinationReason,
  ParseDestinationParams,
  ParseDestinationResult,
} from "./index.types"
import { resolveIntraledgerDestination } from "./intraledger"
import { resolveLightningDestination } from "./lightning"
import { resolveLnurlDestination } from "./lnurl"
import { resolveOnchainDestination } from "./onchain"

export * from "./intraledger"
export * from "./lightning"
export * from "./lnurl"
export * from "./onchain"

export const parseDestination = async ({
  rawInput,
  myWalletIds,
  // bitcoinNetwork, // hard coded to mainnet
  lnurlDomains,
  accountDefaultWalletQuery,
}: ParseDestinationParams): Promise<ParseDestinationResult> => {
  const parsedDestination = parsePaymentDestination({
    destination: rawInput,
    network: "mainnet" as NetworkGaloyClient, // hard coded to mainnet
    lnAddressDomains: lnurlDomains,
  })

  switch (parsedDestination.paymentType) {
    case PaymentType.Intraledger: {
      return resolveIntraledgerDestination({
        parsedIntraledgerDestination: parsedDestination,
        accountDefaultWalletQuery,
        myWalletIds,
      })
    }
    case PaymentType.Lnurl: {
      return resolveLnurlDestination({
        parsedLnurlDestination: parsedDestination,
        lnurlDomains,
        accountDefaultWalletQuery,
        myWalletIds,
      })
    }
    case PaymentType.Lightning: {
      return resolveLightningDestination(parsedDestination)
    }
    case PaymentType.Onchain: {
      return resolveOnchainDestination(parsedDestination)
    }
    default: {
      return {
        valid: false,
        invalidReason: InvalidDestinationReason.UnknownDestination,
        invalidPaymentDestination: parsedDestination as ParsedPaymentDestination,
      } as const
    }
  }
}
