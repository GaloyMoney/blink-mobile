import React, { useEffect, useState } from "react"
import {
  InternalCreatePaymentRequestParams,
  Invoice,
  InvoiceType,
  PaymentQuotation,
  PaymentQuotationState,
  PaymentRequest,
} from "./payment/index.types"
import {
  WalletCurrency,
  useLnInvoiceCreateMutation,
  useLnNoAmountInvoiceCreateMutation,
  useLnUsdInvoiceCreateMutation,
  useOnChainAddressCurrentMutation,
  usePaymentRequestQuery,
  useRealtimePriceQuery,
} from "@app/graphql/generated"
import { createPaymentRequest } from "./payment/payment-request"

import { usePriceConversion } from "@app/hooks"
import { WalletDescriptor } from "@app/types/wallets"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getBtcWallet, getDefaultWallet } from "@app/graphql/wallets-utils"
import { createPaymentQuotation } from "./payment/payment-quotation"

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
      username
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

  mutation lnNoAmountInvoiceCreate($input: LnNoAmountInvoiceCreateInput!) {
    lnNoAmountInvoiceCreate(input: $input) {
      errors {
        message
      }
      invoice {
        paymentHash
        paymentRequest
        paymentSecret
      }
    }
  }

  mutation lnInvoiceCreate($input: LnInvoiceCreateInput!) {
    lnInvoiceCreate(input: $input) {
      errors {
        message
      }
      invoice {
        paymentHash
        paymentRequest
        paymentSecret
        satoshis
      }
    }
  }

  mutation onChainAddressCurrent($input: OnChainAddressCurrentInput!) {
    onChainAddressCurrent(input: $input) {
      errors {
        message
      }
      address
    }
  }

  mutation lnUsdInvoiceCreate($input: LnUsdInvoiceCreateInput!) {
    lnUsdInvoiceCreate(input: $input) {
      errors {
        message
      }
      invoice {
        paymentHash
        paymentRequest
        paymentSecret
        satoshis
      }
    }
  }
`

export const useReceiveBitcoin = () => {
  const [lnNoAmountInvoiceCreate] = useLnNoAmountInvoiceCreateMutation()
  const [lnUsdInvoiceCreate] = useLnUsdInvoiceCreateMutation()
  const [lnInvoiceCreate] = useLnInvoiceCreateMutation()
  const [onChainAddressCurrent] = useOnChainAddressCurrentMutation()

  const mutations = {
    lnNoAmountInvoiceCreate,
    lnUsdInvoiceCreate,
    lnInvoiceCreate,
    onChainAddressCurrent,
  }

  const [preq, setPR] = useState<PaymentRequest<WalletCurrency> | null>(null)
  const [pquote, setPQ] = useState<PaymentQuotation | null>(null)

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

  const bitcoinWallet = getBtcWallet(data?.me?.defaultAccount?.wallets)

  const username = data?.me?.username

  const { convertMoneyAmount: _convertMoneyAmount } = usePriceConversion()
  useEffect(() => {
    if (_convertMoneyAmount && defaultWallet && bitcoinWallet && username) {
      const defaultWalletDescriptor = {
        currency: defaultWallet.walletCurrency,
        id: defaultWallet.id,
      }

      const bitcoinWalletDescriptor = {
        currency: WalletCurrency.Btc,
        id: bitcoinWallet.id,
      }

      const initialPRParams: InternalCreatePaymentRequestParams<WalletCurrency> = {
        type: Invoice.Lightning,
        defaultWalletDescriptor,
        bitcoinWalletDescriptor,
        convertMoneyAmount: _convertMoneyAmount,
        username,
      }
      setPR(createPaymentRequest(initialPRParams))
    }
  }, [_convertMoneyAmount, defaultWallet, bitcoinWallet, username])

  useEffect(() => {
    if (preq) {
      setPQ(
        createPaymentQuotation({
          mutations,
          paymentRequest: preq,
        }),
      )
    }
  }, [
    preq?.type,
    preq?.unitOfAccountAmount,
    preq?.memo,
    preq?.receivingWalletDescriptor,
    setPQ,
  ])

  useEffect(() => {
    if (pquote && pquote.state === PaymentQuotationState.Idle) {
      setPQ((pq) => pq && pq.setState(PaymentQuotationState.Loading))
      pquote.generateQuote().then((newPQ) => setPQ(newPQ))
    }
  }, [pquote?.state])

  if (!preq) return null

  const setType = (type: InvoiceType) => setPR((pr) => pr && pr.setType(type))

  return { ...preq, setType, ...pquote }
}
