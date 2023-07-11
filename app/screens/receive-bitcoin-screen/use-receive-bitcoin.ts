import React, { useEffect, useState } from "react"
import {
  InternalCreatePaymentRequestParams,
  Invoice,
  InvoiceType,
  PaymentRequest,
} from "./payment/index.types"
import {
  WalletCurrency,
  usePaymentRequestQuery,
  useRealtimePriceQuery,
} from "@app/graphql/generated"
import { createPaymentRequest } from "./payment/payment-request"

import { usePriceConversion } from "@app/hooks"
import { WalletDescriptor } from "@app/types/wallets"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getDefaultWallet } from "@app/graphql/wallets-utils"

gql`
  query paymentRequest {
    globals {
      network
      feesInformation {
        deposit {
          minBankFee
          minBankFeeThreshold
        }
      }
    }
    me {
      id
      defaultAccount {
        id
        wallets {
          id
          balance
          walletCurrency
        }
        defaultWalletId
      }
    }
  }
`

export const useReceiveBitcoin = () => {
  const [pr, setPR] = useState<PaymentRequest<WalletCurrency> | null>(null)

  const isAuthed = useIsAuthed()

  const { data } = usePaymentRequestQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })

  // forcing price refresh
  useRealtimePriceQuery({
    fetchPolicy: "network-only",
    skip: !isAuthed,
  })

  const defaultWallet = getDefaultWallet(
    data?.me?.defaultAccount?.wallets,
    data?.me?.defaultAccount?.defaultWalletId,
  )

  const { convertMoneyAmount: _convertMoneyAmount } = usePriceConversion()
  useEffect(() => {
    if (_convertMoneyAmount && defaultWallet) {
      const defaultWalletDescriptor = {
        currency: defaultWallet.walletCurrency,
        id: defaultWallet.id,
      }

      const initialPRParams: InternalCreatePaymentRequestParams<WalletCurrency> = {
        type: Invoice.Lightning,
        defaultWalletDescriptor,
        convertMoneyAmount: _convertMoneyAmount,
      }
      setPR(createPaymentRequest(initialPRParams))
    }
  }, [_convertMoneyAmount, defaultWallet])

  if (!pr) return null

  const setType = (type: InvoiceType) => setPR((pr) => pr && pr.setType(type))
  return { ...pr, setType }
}
