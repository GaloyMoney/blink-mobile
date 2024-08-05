import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"
import {
  BaseCreatePaymentRequestCreationDataParams,
  Invoice,
  InvoiceType,
  PaymentRequest,
  PaymentRequestState,
  PaymentRequestCreationData,
  // InvoiceData,
} from "./payment/index.types"
import {
  // LnNoAmountInvoicePayload,
  WalletCurrency,
  useLnInvoiceCreateMutation,
  useLnNoAmountInvoiceCreateMutation,
  useLnUsdInvoiceCreateMutation,
  useOnChainAddressCurrentMutation,
  usePaymentRequestQuery,
  useRealtimePriceQuery,
} from "@app/graphql/generated"
import { createPaymentRequestCreationData } from "./payment/payment-request-creation-data"

import { useAppConfig, useBreez, usePriceConversion } from "@app/hooks"
import Clipboard from "@react-native-clipboard/clipboard"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getUsdWallet } from "@app/graphql/wallets-utils"
import { createPaymentRequest } from "./payment/payment-request"
import { MoneyAmount, WalletOrDisplayCurrency } from "@app/types/amounts"
import { useLnUpdateHashPaid } from "@app/graphql/ln-update-context"
import { generateFutureLocalTime, secondsToH, secondsToHMS } from "./payment/helpers"
import { toastShow } from "@app/utils/toast"
import { useI18nContext } from "@app/i18n/i18n-react"

import crashlytics from "@react-native-firebase/crashlytics"
import { Alert, Share } from "react-native"
import { TranslationFunctions } from "@app/i18n/i18n-types"
import { BtcWalletDescriptor } from "@app/types/wallets"
import { ReceiveDestination } from "../send-bitcoin-screen/payment-destination/index.types"
import fetch from "cross-fetch"

import { useAppSelector } from "@app/store/redux"
import { usePersistentStateContext } from "@app/store/persistent-state"

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

export const useReceiveBitcoin = (isFirstTransaction: Boolean, initPRParams = {}) => {
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
  const { persistentState } = usePersistentStateContext()
  const [prcd, setPRCD] = useState<PaymentRequestCreationData<WalletCurrency> | null>(
    null,
  )
  const [pr, setPR] = useState<PaymentRequest | null>(null)
  const [memoChangeText, setMemoChangeText] = useState<string | null>(null)

  const [expiresInSeconds, setExpiresInSeconds] = useState<number | null>(null)
  const [isSetLightningAddressModalVisible, setIsSetLightningAddressModalVisible] =
    useState(false)
  const toggleIsSetLightningAddressModalVisible = () => {
    setIsSetLightningAddressModalVisible(!isSetLightningAddressModalVisible)
  }

  const { isAdvanceMode } = useAppSelector((state) => state.settings)
  const { btcWallet } = useBreez()
  const { LL } = useI18nContext()
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

  const defaultWallet = persistentState.defaultWallet

  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

  const username = data?.me?.username

  const appConfig = useAppConfig().appConfig
  const posUrl = appConfig.galoyInstance.posUrl
  const lnAddressHostname = appConfig.galoyInstance.lnAddressHostname

  const { convertMoneyAmount: _convertMoneyAmount } = usePriceConversion()

  // Initialize Payment Request Creation Data
  useLayoutEffect(() => {
    if (
      prcd === null &&
      _convertMoneyAmount &&
      defaultWallet &&
      posUrl &&
      data?.globals?.network
    ) {
      const defaultWalletDescriptor = {
        currency: defaultWallet.walletCurrency,
        id: defaultWallet.id,
      }

      let bitcoinWalletDescriptor = undefined

      if (isAdvanceMode && btcWallet) {
        bitcoinWalletDescriptor = {
          currency: btcWallet.walletCurrency,
          id: btcWallet.id,
        } as BtcWalletDescriptor
      }

      const initialPRParams: BaseCreatePaymentRequestCreationDataParams<WalletCurrency> =
        {
          type: Invoice.Lightning,
          defaultWalletDescriptor,
          bitcoinWalletDescriptor,
          convertMoneyAmount: _convertMoneyAmount,
          username: username || undefined,
          posUrl,
          unitOfAccountAmount:
            defaultWallet.walletCurrency === "BTC" && isFirstTransaction
              ? {
                  amount: 500,
                  currency: "DisplayCurrency",
                  currencyCode: "USD",
                }
              : undefined,
          network: data.globals?.network,
          ...initPRParams,
        }
      setPRCD(createPaymentRequestCreationData(initialPRParams))
    }
  }, [_convertMoneyAmount, defaultWallet, btcWallet, username, isAdvanceMode])

  // Initialize Payment Request
  useLayoutEffect(() => {
    if (prcd) {
      setPR(
        createPaymentRequest({
          mutations,
          creationData: prcd,
        }),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    prcd?.type,
    prcd?.unitOfAccountAmount,
    prcd?.memo,
    prcd?.receivingWalletDescriptor,
    prcd?.username,
    setPR,
  ])

  // Generate Payment Request
  useLayoutEffect(() => {
    if (pr && pr.state === PaymentRequestState.Idle) {
      setPR((pq) => pq && pq.setState(PaymentRequestState.Loading))
      pr.generateRequest().then((newPR) =>
        setPR((currentPR) => {
          // don't override payment request if the request is from different request
          if (currentPR?.creationData === newPR.creationData) return newPR
          return currentPR
        }),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pr?.state])

  // Setting it to idle would trigger last useEffect hook to regenerate invoice
  const regenerateInvoice = () => {
    if (expiresInSeconds === 0) setPR((pq) => pq && pq.setState(PaymentRequestState.Idle))
  }

  // If Username updates
  useEffect(() => {
    if (username && username !== null && username !== prcd?.username) {
      setPRCD((prcd) => prcd && prcd.setUsername(username))
    }
  }, [username, prcd?.username, setPRCD])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastHash])

  // For Expires In
  useLayoutEffect(() => {
    if (pr?.info?.data?.invoiceType === "Lightning" && pr.info?.data?.expiresAt) {
      let intervalId: undefined | NodeJS.Timeout = undefined

      const setExpiresTime = () => {
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
      }

      setExpiresTime()
      intervalId = setInterval(setExpiresTime, 1000)

      return () => {
        clearInterval(intervalId)
        setExpiresInSeconds(null)
      }
    }
  }, [pr?.info?.data, setExpiresInSeconds])

  // Clean Memo
  useLayoutEffect(() => {
    if (memoChangeText === "") {
      setPRCD((pr) => {
        if (pr && pr.setMemo) {
          return pr.setMemo("")
        }
        return pr
      })
    }
  }, [memoChangeText, setPRCD])

  const { copyToClipboard, share } = useMemo(() => {
    if (!pr) {
      return {}
    }

    const paymentFullUri = pr.info?.data?.getFullUriFn({})

    const copyToClipboard = () => {
      if (!paymentFullUri) return

      Clipboard.setString(paymentFullUri)

      let msgFn: (translations: TranslationFunctions) => string
      if (pr.creationData.type === Invoice.OnChain)
        msgFn = (translations) => translations.ReceiveScreen.copyClipboardBitcoin()
      else if (pr.creationData.type === Invoice.PayCode)
        msgFn = (translations) => translations.ReceiveScreen.copyClipboardPaycode()
      else msgFn = (translations) => translations.ReceiveScreen.copyClipboard()

      toastShow({
        message: msgFn,
        currentTranslation: LL,
        type: "success",
      })
    }

    const share = async () => {
      if (!paymentFullUri) return
      try {
        const result = await Share.share({ message: paymentFullUri })

        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // shared with activity type of result.activityType
          } else {
            // shared
          }
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      } catch (err) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          Alert.alert(err.message)
        }
      }
    }

    return {
      copyToClipboard,
      share,
    }
  }, [pr, LL])

  const receiveViaNFC = useCallback(
    async (destination: ReceiveDestination) => {
      if (pr?.info?.data?.invoiceType !== "Lightning" || !pr.info.data.paymentRequest) {
        Alert.alert(LL.RedeemBitcoinScreen.error())
        return
      }

      const { callback, k1 } = destination.validDestination

      const urlObject = new URL(callback)
      const searchParams = urlObject.searchParams
      searchParams.set("k1", k1)
      searchParams.set("pr", pr.info.data.paymentRequest)

      const url = urlObject.toString()

      const result = await fetch(url)
      const lnurlResponse = await result.json()

      if (result.ok) {
        if (lnurlResponse?.status?.toLowerCase() !== "ok") {
          console.error(lnurlResponse, "error with redeeming")
          Alert.alert(lnurlResponse.reason || LL.RedeemBitcoinScreen.redeemingError())
        }
      } else if (
        (lnurlResponse.reason && lnurlResponse.reason.includes("not within bounds")) ||
        lnurlResponse.reason.includes("Amount is bigger than the maximum")
      ) {
        Alert.alert("Payment Failed: Insufficient Funds")
      } else {
        Alert.alert(lnurlResponse.reason || LL.RedeemBitcoinScreen.submissionError())
      }
    },
    [LL.RedeemBitcoinScreen, pr],
  )

  if (!prcd) return null

  const setType = (type: InvoiceType) => {
    setPRCD((pr) => pr && pr.setType(type))
    setPRCD((pr) => {
      if (pr && pr.setMemo) {
        return pr.setMemo("")
      }
      return pr
    })
    setMemoChangeText("")
  }

  const setMemo = () => {
    setPRCD((pr) => {
      if (pr && memoChangeText && pr.setMemo) {
        return pr.setMemo(memoChangeText)
      }
      return pr
    })
  }
  const setReceivingWallet = (walletCurrency: WalletCurrency) => {
    setPRCD((pr) => {
      if (pr && pr.setReceivingWalletDescriptor) {
        if (walletCurrency === WalletCurrency.Btc && isAdvanceMode && btcWallet) {
          if (isFirstTransaction) {
            setAmount({
              amount: 500,
              currency: "DisplayCurrency",
              currencyCode: "USD",
            })
          }
          return pr.setReceivingWalletDescriptor({
            id: btcWallet.id,
            currency: WalletCurrency.Btc,
          })
        } else if (walletCurrency === WalletCurrency.Usd && usdWallet) {
          setAmount(undefined)
          return pr.setReceivingWalletDescriptor({
            id: usdWallet.id,
            currency: WalletCurrency.Usd,
          })
        }
      }
      return pr
    })
  }
  const setAmount = (amount?: MoneyAmount<WalletOrDisplayCurrency>) => {
    setPRCD((pr) => {
      if (pr && pr.setAmount) {
        return pr.setAmount(amount)
      }
      return pr
    })
  }

  let extraDetails = ""
  if (
    prcd.type === "Lightning" &&
    expiresInSeconds !== null &&
    typeof expiresInSeconds === "number" &&
    pr?.state !== PaymentRequestState.Paid
  ) {
    if (expiresInSeconds > 60 * 60 * 23)
      extraDetails = `${LL.ReceiveScreen.singleUse()} | ${LL.ReceiveScreen.invoiceValidity.validFor1Day()}`
    else if (expiresInSeconds > 60 * 60 * 6)
      extraDetails = `${LL.ReceiveScreen.singleUse()} | ${LL.ReceiveScreen.invoiceValidity.validForNext(
        { duration: secondsToH(expiresInSeconds) },
      )}`
    else if (expiresInSeconds > 60 * 2)
      extraDetails = `${LL.ReceiveScreen.singleUse()} | ${LL.ReceiveScreen.invoiceValidity.validBefore(
        {
          time: generateFutureLocalTime(expiresInSeconds),
        },
      )}`
    else if (expiresInSeconds > 0)
      extraDetails = `${LL.ReceiveScreen.singleUse()} | ${LL.ReceiveScreen.invoiceValidity.expiresIn(
        {
          duration: secondsToHMS(expiresInSeconds),
        },
      )}`
    else if (pr?.state === PaymentRequestState.Expired)
      extraDetails = LL.ReceiveScreen.invoiceExpired()
    else
      extraDetails = `${LL.ReceiveScreen.singleUse()} | ${LL.ReceiveScreen.invoiceValidity.expiresNow()}`
  } else if (prcd.type === "Lightning" && pr?.state === PaymentRequestState.Paid) {
    extraDetails = LL.ReceiveScreen.invoiceHasBeenPaid()
  } else if (prcd.type === "OnChain" && pr?.info?.data?.invoiceType === "OnChain") {
    extraDetails = LL.ReceiveScreen.yourBitcoinOnChainAddress()
  } else if (prcd.type === "PayCode" && pr?.info?.data?.invoiceType === "PayCode") {
    extraDetails = LL.ReceiveScreen.payCodeOrLNURL()
  }

  let readablePaymentRequest = ""
  if (pr?.info?.data?.invoiceType === Invoice.Lightning) {
    const uri = pr.info?.data?.getFullUriFn({})
    readablePaymentRequest = `${uri.slice(0, 10)}..${uri.slice(-10)}`
  } else if (pr?.info?.data?.invoiceType === Invoice.OnChain) {
    const address = pr.info?.data?.address || ""
    readablePaymentRequest = `${address.slice(0, 10)}..${address.slice(-10)}`
  } else if (prcd.type === "PayCode" && pr?.info?.data?.invoiceType === "PayCode") {
    readablePaymentRequest = `${pr.info.data.username}@${lnAddressHostname}`
  }

  return {
    ...prcd,
    setType,
    ...pr,
    extraDetails,
    regenerateInvoice,
    setMemo,
    setReceivingWallet,
    setAmount,
    feesInformation: data?.globals?.feesInformation,
    memoChangeText,
    setMemoChangeText,
    copyToClipboard,
    share,
    isSetLightningAddressModalVisible,
    toggleIsSetLightningAddressModalVisible,
    readablePaymentRequest,
    receiveViaNFC,
  }
}
