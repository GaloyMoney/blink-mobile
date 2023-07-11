import { useEffect, useState } from "react"
import {
  BaseCreatePaymentRequestParams,
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
import { MoneyAmount, WalletOrDisplayCurrency } from "@app/types/amounts"
import { useLnUpdateHashPaid } from "@app/graphql/ln-update-context"

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

  const [expiresInSeconds, setExpiresInSeconds] = useState<number | null>(null)

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

  // Initialize Payment Request
  useEffect(() => {
    if (
      preq === null &&
      _convertMoneyAmount &&
      defaultWallet &&
      bitcoinWallet &&
      username !== null &&
      data?.globals?.network
    ) {
      const defaultWalletDescriptor = {
        currency: defaultWallet.walletCurrency,
        id: defaultWallet.id,
      }

      const bitcoinWalletDescriptor = {
        currency: WalletCurrency.Btc,
        id: bitcoinWallet.id,
      }

      const initialPRParams: BaseCreatePaymentRequestParams<WalletCurrency> = {
        type: Invoice.Lightning,
        defaultWalletDescriptor,
        bitcoinWalletDescriptor,
        convertMoneyAmount: _convertMoneyAmount,
        username,
        network: data.globals?.network,
      }
      setPR(createPaymentRequest(initialPRParams))
    }
  }, [_convertMoneyAmount, defaultWallet, bitcoinWallet, username])

  // Initialize Payment Quotation
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

  // Generate Payment Quote
  useEffect(() => {
    if (pquote && pquote.state === PaymentQuotationState.Idle) {
      setPQ((pq) => pq && pq.setState(PaymentQuotationState.Loading))
      pquote.generateQuote().then((newPQ) =>
        setPQ((currentPQ) => {
          // don't override payment quote if the quote is from different request
          if (currentPQ?.paymentRequest === newPQ.paymentRequest) return newPQ
          else return currentPQ
        }),
      )
    }
  }, [pquote?.state])

  // Hack - Setting it to idle would trigger last useEffect hook
  const regenerateInvoice = () => {
    if (expiresInSeconds === 0)
      setPQ((pq) => pq && pq.setState(PaymentQuotationState.Idle))
  }

  // For Detecting Paid
  const lastHash = useLnUpdateHashPaid()
  useEffect(() => {
    if (
      pquote?.state === PaymentQuotationState.Created &&
      pquote.quote?.data?.invoiceType === "Lightning" &&
      lastHash === pquote.quote.data.paymentHash
    ) {
      setPQ((pq) => pq && pq.setState(PaymentQuotationState.Paid))
    }
  }, [lastHash])

  // For Expires In
  useEffect(() => {
    if (
      pquote?.quote?.data?.invoiceType === "Lightning" &&
      pquote.quote?.data?.expiresAt
    ) {
      const intervalId = setInterval(() => {
        const currentTime = new Date()
        const expiresAt =
          pquote?.quote?.data?.invoiceType === "Lightning" &&
          pquote.quote?.data?.expiresAt
        if (!expiresAt) return

        const remainingSeconds = Math.floor(
          (expiresAt.getTime() - currentTime.getTime()) / 1000,
        )

        if (remainingSeconds >= 0) {
          setExpiresInSeconds(remainingSeconds)
        } else {
          clearInterval(intervalId)
          setExpiresInSeconds(0)
          setPQ((pq) => pq && pq.setState(PaymentQuotationState.Expired))
        }
      }, 1000)

      return () => {
        clearInterval(intervalId)
        setExpiresInSeconds(null)
      }
    }
  }, [pquote?.quote?.data, setExpiresInSeconds])

  if (!preq) return null

  const setType = (type: InvoiceType) => setPR((pr) => pr && pr.setType(type))
  const setMemo = (memo: string) => {
    setPR((pr) => {
      if (pr && pr.setMemo) {
        return pr.setMemo(memo)
      }
      return pr
    })
  }
  const setReceivingWalletDescriptor = (
    receivingWalletDescriptor: WalletDescriptor<WalletCurrency>,
  ) => {
    setPR((pr) => {
      if (pr && pr.setReceivingWalletDescriptor) {
        return pr.setReceivingWalletDescriptor(receivingWalletDescriptor)
      }
      return pr
    })
  }
  const setAmount = (amount: MoneyAmount<WalletOrDisplayCurrency>) => {
    setPR((pr) => {
      if (pr && pr.setAmount) {
        return pr.setAmount(amount)
      }
      return pr
    })
  }

  return {
    ...preq,
    setType,
    ...pquote,
    expiresInSeconds,
    regenerateInvoice,
    setMemo,
    setReceivingWalletDescriptor,
    setAmount,
    feesInformation: data?.globals?.feesInformation,
  }
}
