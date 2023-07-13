import { useEffect, useMemo, useState } from "react"
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

import { useAppConfig, usePriceConversion } from "@app/hooks"
import Clipboard from "@react-native-clipboard/clipboard"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getBtcWallet, getDefaultWallet, getUsdWallet } from "@app/graphql/wallets-utils"
import { createPaymentRequest } from "./payment/payment-request"
import { MoneyAmount, WalletOrDisplayCurrency } from "@app/types/amounts"
import { useLnUpdateHashPaid } from "@app/graphql/ln-update-context"
import { generateFutureLocalTime, secondsToH, secondsToHMS } from "./payment/helpers"
import { toastShow } from "@app/utils/toast"
import { useI18nContext } from "@app/i18n/i18n-react"

import crashlytics from "@react-native-firebase/crashlytics"
import { Alert, Share } from "react-native"

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
  const [memoChangeText, setMemoChangeText] = useState<string | null>(null)

  const [expiresInSeconds, setExpiresInSeconds] = useState<number | null>(null)
  const [
    isSetLightningAddressModalVisible,
    setIsSetLightningAddressModalVisible,
  ] = useState(false)
  const toggleIsSetLightningAddressModalVisible = () => {
    setIsSetLightningAddressModalVisible(!isSetLightningAddressModalVisible)
  }

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

  const defaultWallet = getDefaultWallet(
    data?.me?.defaultAccount?.wallets,
    data?.me?.defaultAccount?.defaultWalletId,
  )

  const bitcoinWallet = getBtcWallet(data?.me?.defaultAccount?.wallets)
  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

  const username = data?.me?.username

  const appConfig = useAppConfig().appConfig
  const posUrl = appConfig.galoyInstance.posUrl
  const lnAddressHostname = appConfig.galoyInstance.lnAddressHostname

  const { convertMoneyAmount: _convertMoneyAmount } = usePriceConversion()

  // Initialize Payment Request Creation Data
  useEffect(() => {
    if (
      prcd === null &&
      _convertMoneyAmount &&
      defaultWallet &&
      bitcoinWallet &&
      posUrl &&
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
        username: username !== null ? username : undefined,
        posUrl,
        network: data.globals?.network,
      }
      setPRCD(createPaymentRequestCreationData(initialPRParams))
    }
  }, [_convertMoneyAmount, defaultWallet, bitcoinWallet, username])

  // Initialize Payment Request
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
    prcd?.username,
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

  // Setting it to idle would trigger last useEffect hook to regenerate invoice
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
      const intervalId = setInterval(setExpiresTime, 1000)

      return () => {
        clearInterval(intervalId)
        setExpiresInSeconds(null)
      }
    }
  }, [pr?.info?.data, setExpiresInSeconds])

  // Clean Memo
  useEffect(() => {
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

      toastShow({
        message: (translations) => translations.ReceiveScreen.copyClipboard(),
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
  }, [pr?.info?.data, LL])

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
    extraDetails = `${pr.info.data.username}@${lnAddressHostname}`
  }

  let readablePaymentRequest = ""
  if (pr?.info?.data?.invoiceType === Invoice.Lightning) {
    const uri = pr.info?.data?.getFullUriFn({})
    readablePaymentRequest = `${uri.slice(0, 6)}..${uri.slice(-6)}`
  } else if (pr?.info?.data?.invoiceType === Invoice.OnChain) {
    const address = pr.info?.data?.address || ""
    readablePaymentRequest = `${address.slice(0, 6)}..${address.slice(-6)}`
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
  }
}
