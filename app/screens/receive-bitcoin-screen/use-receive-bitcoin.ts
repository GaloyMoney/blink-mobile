import { useEffect, useState } from "react"
import {
  BaseCreatePaymentRequestCreationDataParams,
  Invoice,
  InvoiceType,
  PaymentRequest,
  PaymentRequestState,
  PaymentRequestCreationData,
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
import { createPaymentRequestCreationData } from "./payment/payment-request-creation-data"

import { usePriceConversion } from "@app/hooks"
import { WalletDescriptor } from "@app/types/wallets"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getBtcWallet, getDefaultWallet, getUsdWallet } from "@app/graphql/wallets-utils"
import { createPaymentRequest } from "./payment/payment-request"
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

  const [prcd, setPRCD] = useState<PaymentRequestCreationData<WalletCurrency> | null>(
    null,
  )
  const [pr, setPR] = useState<PaymentRequest | null>(null)

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
  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

  const username = data?.me?.username

  const { convertMoneyAmount: _convertMoneyAmount } = usePriceConversion()

  // Initialize Payment Request
  useEffect(() => {
    if (
      prcd === null &&
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

      const initialPRParams: BaseCreatePaymentRequestCreationDataParams<WalletCurrency> = {
        type: Invoice.Lightning,
        defaultWalletDescriptor,
        bitcoinWalletDescriptor,
        convertMoneyAmount: _convertMoneyAmount,
        username,
        network: data.globals?.network,
      }
      setPRCD(createPaymentRequestCreationData(initialPRParams))
    }
  }, [_convertMoneyAmount, defaultWallet, bitcoinWallet, username])

  // Initialize Payment Quotation
  useEffect(() => {
    if (prcd) {
      setPR(
        createPaymentRequest({
          mutations,
          creationData: prcd,
        }),
      )
    }
  }, [
    prcd?.type,
    prcd?.unitOfAccountAmount,
    prcd?.memo,
    prcd?.receivingWalletDescriptor,
    setPR,
  ])

  // Generate Payment Request
  useEffect(() => {
    if (pr && pr.state === PaymentRequestState.Idle) {
      setPR((pq) => pq && pq.setState(PaymentRequestState.Loading))
      pr.generateRequest().then((newPR) =>
        setPR((currentPR) => {
          // don't override payment request if the request is from different request
          if (currentPR?.creationData === newPR.creationData) return newPR
          else return currentPR
        }),
      )
    }
  }, [pr?.state])

  // Hack - Setting it to idle would trigger last useEffect hook
  const regenerateInvoice = () => {
    if (expiresInSeconds === 0) setPR((pq) => pq && pq.setState(PaymentRequestState.Idle))
  }

  // For Detecting Paid
  const lastHash = useLnUpdateHashPaid()
  useEffect(() => {
    if (
      pr?.state === PaymentRequestState.Created &&
      pr.info?.data?.invoiceType === "Lightning" &&
      lastHash === pr.info.data.paymentHash
    ) {
      setPR((pq) => pq && pq.setState(PaymentRequestState.Paid))
    }
  }, [lastHash])

  // For Expires In
  useEffect(() => {
    if (pr?.info?.data?.invoiceType === "Lightning" && pr.info?.data?.expiresAt) {
      const intervalId = setInterval(() => {
        const currentTime = new Date()
        const expiresAt =
          pr?.info?.data?.invoiceType === "Lightning" && pr.info?.data?.expiresAt
        if (!expiresAt) return

        const remainingSeconds = Math.floor(
          (expiresAt.getTime() - currentTime.getTime()) / 1000,
        )

        if (remainingSeconds >= 0) {
          setExpiresInSeconds(remainingSeconds)
        } else {
          clearInterval(intervalId)
          setExpiresInSeconds(0)
          setPR((pq) => pq && pq.setState(PaymentRequestState.Expired))
        }
      }, 1000)

      return () => {
        clearInterval(intervalId)
        setExpiresInSeconds(null)
      }
    }
  }, [pr?.info?.data, setExpiresInSeconds])

  if (!prcd) return null

  const setType = (type: InvoiceType) => setPRCD((pr) => pr && pr.setType(type))
  const setMemo = (memo: string) => {
    setPRCD((pr) => {
      if (pr && pr.setMemo) {
        return pr.setMemo(memo)
      }
      return pr
    })
  }
  const setReceivingWallet = (walletCurrency: WalletCurrency) => {
    setPRCD((pr) => {
      if (pr && pr.setReceivingWalletDescriptor) {
        if (walletCurrency === WalletCurrency.Btc && bitcoinWallet) {
          return pr.setReceivingWalletDescriptor({
            id: bitcoinWallet.id,
            currency: WalletCurrency.Btc,
          })
        } else if (walletCurrency === WalletCurrency.Usd && usdWallet) {
          return pr.setReceivingWalletDescriptor({
            id: usdWallet.id,
            currency: WalletCurrency.Usd,
          })
        }
      }
      return pr
    })
  }
  const setAmount = (amount: MoneyAmount<WalletOrDisplayCurrency>) => {
    setPRCD((pr) => {
      if (pr && pr.setAmount) {
        return pr.setAmount(amount)
      }
      return pr
    })
  }

  return {
    ...prcd,
    setType,
    ...pr,
    expiresInSeconds,
    regenerateInvoice,
    setMemo,
    setReceivingWallet,
    setAmount,
    feesInformation: data?.globals?.feesInformation,
  }
}
