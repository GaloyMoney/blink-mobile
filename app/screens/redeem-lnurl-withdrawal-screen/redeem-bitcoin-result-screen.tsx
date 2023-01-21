import { useSubscriptionUpdates, usePriceConversion } from "@app/hooks"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { StackScreenProps } from "@react-navigation/stack"
import { View, ActivityIndicator } from "react-native"
import React, { useCallback, useEffect, useState, useMemo } from "react"
import { Text } from "@rneui/base"
import { FakeCurrencyInput } from "react-native-currency-input"
import EStyleSheet from "react-native-extended-stylesheet"
import { palette } from "@app/theme"

import { useI18nContext } from "@app/i18n/i18n-react"
import { logGeneratePaymentRequest } from "@app/utils/analytics"
import {
  WalletCurrency,
  LnInvoice,
  useLnInvoiceCreateMutation,
  useLnUsdInvoiceCreateMutation,
} from "@app/graphql/generated"

import fetch from "cross-fetch"
import { testProps } from "../../../utils/testProps"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"

import { TYPE_LIGHTNING_BTC, TYPE_LIGHTNING_USD } from "../../utils/wallet"

const styles = EStyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "14rem",
    marginLeft: 20,
    marginRight: 20,
  },
  inputForm: {
    marginVertical: 20,
  },
  currencyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginTop: 10,
    backgroundColor: palette.white,
    borderRadius: 10,
  },
  infoText: {
    color: palette.midGrey,
    fontSize: "12rem",
  },
  withdrawableDescriptionText: {
    color: palette.midGrey,
    fontSize: "14rem",
    textAlign: "center",
  },
  walletBalanceInput: {
    color: palette.lapisLazuli,
    fontSize: 20,
    fontWeight: "600",
  },
  convertedAmountText: {
    color: palette.coolGrey,
    fontSize: 12,
  },
  currencyInput: {
    flexDirection: "column",
    flex: 1,
  },
  qr: {
    alignItems: "center",
  },
})

const RedeemBitcoinResultScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "redeemBitcoinResult">) => {
  const {
    callback,
    domain,
    defaultDescription,
    k1,
    minWithdrawableSatoshis,
    maxWithdrawableSatoshis,
    walletId,
    receiveCurrency,
    satAmount,
    satAmountInUsd,
    amountCurrency,
  } = route.params

  const type =
    receiveCurrency === WalletCurrency.Btc ? TYPE_LIGHTNING_BTC : TYPE_LIGHTNING_USD

  const { LL } = useI18nContext()

  useEffect(() => {
    if (receiveCurrency === WalletCurrency.Usd) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.usdTitle() })
    }

    if (receiveCurrency === WalletCurrency.Btc) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.title() })
    }
  }, [receiveCurrency, navigation, LL])

  const { convertCurrencyAmount } = usePriceConversion()

  const minSatAmountInUsd = convertCurrencyAmount({
    amount: satAmount,
    from: "BTC",
    to: "USD",
  })
  const maxSatAmountInUsd = convertCurrencyAmount({
    amount: satAmount,
    from: "BTC",
    to: "USD",
  })
  const usdAmount = satAmountInUsd
  const usdAmountInSats = Math.round(
    convertCurrencyAmount({
      amount: usdAmount ?? 0,
      from: "USD",
      to: "BTC",
    }),
  )

  const [err, setErr] = useState("")
  const [lnServiceErrorReason, setLnServiceErrorReason] = useState("")
  const [withdrawalInvoice, setInvoice] = useState<LnInvoice | null>(null)

  const [memo] = useState(defaultDescription)

  const { lnUpdate } = useSubscriptionUpdates()
  const invoicePaid =
    lnUpdate?.paymentHash === withdrawalInvoice?.paymentHash &&
    lnUpdate?.status === "PAID"

  const [lnInvoiceCreate] = useLnInvoiceCreateMutation()
  const [lnUsdInvoiceCreate] = useLnUsdInvoiceCreateMutation()

  const createWithdrawRequestInvoice = useCallback(
    async ({ satAmount, memo }) => {
      setInvoice(null)
      try {
        if (type === TYPE_LIGHTNING_BTC) {
          logGeneratePaymentRequest({
            paymentType: "lightning",
            hasAmount: true,
            receivingWallet: WalletCurrency.Btc,
          })
          const {
            data: {
              lnInvoiceCreate: { invoice, errors },
            },
          } = await lnInvoiceCreate({
            variables: {
              input: { walletId, amount: satAmount, memo },
            },
          })
          if (errors && errors.length !== 0) {
            console.error(errors, "error with lnInvoiceCreate")
            setErr(LL.RedeemBitcoinScreen.error())
            return
          }

          setInvoice(invoice)
        } else {
          logGeneratePaymentRequest({
            paymentType: "lightning",
            hasAmount: true,
            receivingWallet: WalletCurrency.Usd,
          })
          const {
            data: {
              lnUsdInvoiceCreate: { invoice, errors },
            },
          } = await lnUsdInvoiceCreate({
            variables: {
              input: { walletId, amount: satAmountInUsd * 100, memo },
            },
          })

          if (errors && errors.length !== 0) {
            console.error(errors, "error with lnInvoiceCreate")
            setErr(LL.ReceiveBitcoinScreen.error())
            return
          }
          setInvoice(invoice)
        }
      } catch (err) {
        console.error(err, "error with AddInvoice")
        setErr(`${err}`)
        throw err
      }
    },
    [lnInvoiceCreate, lnUsdInvoiceCreate, walletId, type, satAmountInUsd, LL],
  )

  const submitLNURLWithdrawRequest = useCallback(
    async (generatedInvoice) => {
      const url = `${callback}${callback.includes("?") ? "&" : "?"}k1=${k1}&pr=${
        generatedInvoice.paymentRequest
      }`

      const result = await fetch(url)

      if (result.ok) {
        const lnurlResponse = await result.json()
        if (lnurlResponse?.status?.toLowerCase() === "ok") {
          // TODO: Set processing payment
        } else {
          console.error(lnurlResponse, "error with redeeming")
          setErr(LL.RedeemBitcoinScreen.redeemingError())
          if (lnurlResponse?.reason) {
            setLnServiceErrorReason(lnurlResponse.reason)
          }
        }
      } else {
        console.error(result.text(), "error with submitting withdrawalRequest")
        setErr(LL.RedeemBitcoinScreen.submissionError())
      }
    },
    [callback, LL, k1],
  )

  useEffect((): void | (() => void) => {
    if (withdrawalInvoice) {
      submitLNURLWithdrawRequest(withdrawalInvoice)
    } else {
      createWithdrawRequestInvoice({ satAmount, memo })
    }
  }, [
    withdrawalInvoice,
    memo,
    satAmount,
    createWithdrawRequestInvoice,
    submitLNURLWithdrawRequest,
  ])

  const renderSuccessView = useMemo(() => {
    if (invoicePaid) {
      return (
        <View style={styles.container}>
          <View {...testProps("Success Icon")} style={styles.container}>
            <GaloyIcon name={"payment-success"} size={128} />
          </View>
        </View>
      )
    }
    return null
  }, [invoicePaid])

  const renderErrorView = useMemo(() => {
    if (err !== "") {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            {lnServiceErrorReason && (
              <Text style={styles.errorText} selectable>
                {lnServiceErrorReason}
              </Text>
            )}
            <Text style={styles.errorText} selectable>
              {err}
            </Text>
          </View>
        </View>
      )
    }

    return null
  }, [err, lnServiceErrorReason, invoicePaid])

  const renderActivityStatusView = useMemo(() => {
    if (err === "" && !invoicePaid) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <ActivityIndicator size="large" color={palette.blue} />
          </View>
        </View>
      )
    }
    return null
  }, [err, invoicePaid])

  return (
    <View style={styles.container}>
      <View style={[styles.inputForm, styles.container]}>
        {defaultDescription && (
          <Text style={styles.withdrawableDescriptionText}>{defaultDescription}</Text>
        )}
        <View style={styles.currencyInputContainer}>
          <View style={styles.currencyInput}>
            {amountCurrency === WalletCurrency.Btc && (
              <>
                <Text style={styles.infoText}>
                  {LL.RedeemBitcoinScreen.redeemAmountFrom({
                    amountToRedeem: satAmount.toString(),
                    currencyTicker: "sats",
                    domain,
                  })}
                </Text>
                <FakeCurrencyInput
                  value={satAmount}
                  prefix=""
                  delimiter=" "
                  separator="."
                  precision={0}
                  suffix=" sats"
                  minValue={minWithdrawableSatoshis}
                  maxValue={maxWithdrawableSatoshis}
                  style={styles.walletBalanceInput}
                  editable={false}
                  autoFocus
                />
                <FakeCurrencyInput
                  value={satAmountInUsd}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  minValue={minSatAmountInUsd}
                  maxValue={maxSatAmountInUsd}
                  editable={false}
                  style={styles.convertedAmountText}
                />
              </>
            )}
            {amountCurrency === WalletCurrency.Usd && (
              <>
                <Text style={styles.infoText}>
                  {LL.RedeemBitcoinScreen.redeemAmountFrom({
                    amountToRedeem: satAmountInUsd.toFixed(2),
                    currencyTicker: "USD",
                    domain,
                  })}
                </Text>
                <FakeCurrencyInput
                  value={usdAmount}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  style={styles.walletBalanceInput}
                  minValue={minSatAmountInUsd}
                  maxValue={maxSatAmountInUsd}
                  editable={false}
                  autoFocus
                />
                <FakeCurrencyInput
                  value={usdAmountInSats}
                  prefix=""
                  delimiter=","
                  separator="."
                  suffix=" sats"
                  precision={0}
                  minValue={0}
                  editable={false}
                  style={styles.convertedAmountText}
                />
              </>
            )}
          </View>
        </View>

        <View style={styles.qr}>
          {renderSuccessView}
          {renderErrorView}
          {renderActivityStatusView}
        </View>
      </View>
    </View>
  )
}

export default RedeemBitcoinResultScreen
