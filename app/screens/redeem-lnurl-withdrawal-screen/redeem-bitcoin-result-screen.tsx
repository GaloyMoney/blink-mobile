import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ActivityIndicator, View } from "react-native"
// import { PaymentRequest } from "../receive-bitcoin-screen/payment-requests/index.types"

import {
  HomeAuthedDocument,
  LnInvoice,
  useLnUsdInvoiceCreateMutation,
  WalletCurrency,
} from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"

import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import fetch from "cross-fetch"
import { testProps } from "../../utils/testProps"

import { useApolloClient } from "@apollo/client"
import { useLnUpdateHashPaid } from "@app/graphql/ln-update-context"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { makeStyles, useTheme, Text } from "@rneui/themed"
import { withMyLnUpdateSub } from "../receive-bitcoin-screen/my-ln-updates-sub"
import { Screen } from "@app/components/screen"
import {
  InputTypeVariant,
  parseInput,
  withdrawLnurl,
} from "@breeztech/react-native-breez-sdk"

type Prop = {
  route: RouteProp<RootStackParamList, "redeemBitcoinResult">
}

const RedeemBitcoinResultScreen: React.FC<Prop> = ({ route }) => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "redeemBitcoinResult">>()

  const {
    callback,
    domain,
    defaultDescription,
    k1,
    receivingWalletDescriptor,
    unitOfAccountAmount,
    settlementAmount,
    displayAmount,
    lnurl,
  } = route.params

  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const { formatDisplayAndWalletAmount } = useDisplayCurrency()

  const client = useApolloClient()
  const { LL } = useI18nContext()
  const lastHash = useLnUpdateHashPaid()

  useEffect(() => {
    if (receivingWalletDescriptor.currency === WalletCurrency.Usd) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.usdTitle() })
    }

    if (receivingWalletDescriptor.currency === WalletCurrency.Btc) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.title() })
    }
  }, [receivingWalletDescriptor.currency, navigation, LL])

  const [err, setErr] = useState("")
  const [lnServiceErrorReason, setLnServiceErrorReason] = useState("")
  const [withdrawalInvoice, setInvoice] = useState<LnInvoice | null>(null)
  const [success, setSuccess] = useState(false)

  const [memo] = useState(defaultDescription)

  // FIXME: this would be false again if multiple invoice happen to be paid
  // when the user stays on this screen
  const invoicePaid = withdrawalInvoice?.paymentHash === lastHash
  const [lnUsdInvoiceCreate] = useLnUsdInvoiceCreateMutation()

  useEffect(() => {
    if (success || invoicePaid) {
      const id = setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack()
        }
      }, 5000)
      return () => clearTimeout(id)
    }
  }, [success, invoicePaid])

  const createWithdrawRequestInvoice = useCallback(
    async (amount: number, memo: string) => {
      setInvoice(null)
      try {
        const { data } = await lnUsdInvoiceCreate({
          variables: {
            input: {
              walletId: receivingWalletDescriptor.id,
              amount,
              memo,
            },
          },
        })

        if (!data) {
          throw new Error("No data returned from lnInvoiceCreate")
        }

        const {
          lnUsdInvoiceCreate: { invoice, errors },
        } = data

        if (errors && errors.length !== 0) {
          console.error(errors, "error with lnInvoiceCreate")
          setErr(LL.RedeemBitcoinScreen.error())
          return
        }

        invoice && setInvoice(invoice)
      } catch (err) {
        console.error(err, "error with AddInvoice")
        setErr(`${err}`)
        throw err
      }
    },
    [lnUsdInvoiceCreate, receivingWalletDescriptor, LL],
  )

  const submitLNURLWithdrawRequest = useCallback(
    async (generatedInvoice: LnInvoice) => {
      const url = `${callback}${callback.includes("?") ? "&" : "?"}k1=${k1}&pr=${
        generatedInvoice.paymentRequest
      }`

      const result = await fetch(url)

      if (result.ok) {
        const lnurlResponse = await result.json()
        if (lnurlResponse?.status?.toLowerCase() !== "ok") {
          console.error(lnurlResponse, "error with redeeming")
          setErr(LL.RedeemBitcoinScreen.redeemingError())
          if (lnurlResponse?.reason) {
            setLnServiceErrorReason(lnurlResponse.reason)
          }
        }
      } else {
        const lnurlResponse = await result.json()
        console.error(lnurlResponse.reason, "error with submitting withdrawalRequest")
        setErr(LL.RedeemBitcoinScreen.submissionError() + `\n ${lnurlResponse.reason}`)
      }
    },
    [callback, LL, k1],
  )

  useEffect((): void | (() => void) => {
    if (receivingWalletDescriptor.currency === "BTC") {
      redeemToBTCWallet()
    } else {
      if (withdrawalInvoice) {
        submitLNURLWithdrawRequest(withdrawalInvoice)
      } else {
        createWithdrawRequestInvoice(displayAmount.amount, memo)
      }
    }
  }, [
    withdrawalInvoice,
    memo,
    displayAmount,
    createWithdrawRequestInvoice,
    submitLNURLWithdrawRequest,
    lnurl,
  ])

  const redeemToBTCWallet = async () => {
    try {
      const input = await parseInput(lnurl)
      if (input.type === InputTypeVariant.LN_URL_WITHDRAW) {
        const amountMsat = input.data.minWithdrawable
        const lnUrlWithdrawResult = await withdrawLnurl({
          data: input.data,
          amountMsat,
          description: input.data.defaultDescription,
        })
        console.log(lnUrlWithdrawResult)
        if (lnUrlWithdrawResult.type === "ok") {
          setSuccess(true)
        } else if (lnUrlWithdrawResult.type === "errorStatus") {
          setErr(
            lnUrlWithdrawResult?.data?.reason || LL.RedeemBitcoinScreen.redeemingError(),
          )
        }
      }
    } catch (err) {
      setErr(LL.RedeemBitcoinScreen.redeemingError())
    }
  }

  const renderSuccessView = useMemo(() => {
    if (invoicePaid || success) {
      client.refetchQueries({ include: [HomeAuthedDocument] })

      return (
        <View style={styles.container}>
          <View {...testProps("Success Icon")} style={styles.container}>
            <GaloyIcon name={"payment-success"} size={128} />
          </View>
        </View>
      )
    }
    return null
  }, [invoicePaid, styles, client, success])

  const renderErrorView = useMemo(() => {
    if (err !== "") {
      return (
        <View style={styles.container}>
          {lnServiceErrorReason && (
            <Text style={styles.errorText} selectable>
              {lnServiceErrorReason}
            </Text>
          )}
          <Text style={styles.errorText} selectable>
            {err}
          </Text>
        </View>
      )
    }

    return null
  }, [err, lnServiceErrorReason, styles])

  const renderActivityStatusView = useMemo(() => {
    if (err === "" && !invoicePaid && !success) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )
    }
    return null
  }, [err, invoicePaid, success, styles, colors.primary])

  return (
    <Screen preset="scroll" style={styles.contentContainer}>
      <View style={[styles.inputForm, styles.container]}>
        {defaultDescription && (
          <Text type={"p1"} style={styles.withdrawableDescriptionText}>
            {defaultDescription}
          </Text>
        )}
        <View style={styles.currencyInputContainer}>
          <Text style={{ textAlign: "center" }}>
            {LL.RedeemBitcoinScreen.redeemAmountFrom({
              amountToRedeem: formatDisplayAndWalletAmount({
                primaryAmount: unitOfAccountAmount,
                walletAmount: settlementAmount,
                displayAmount,
              }),
              domain,
            })}
          </Text>
        </View>

        <View style={styles.qr}>
          {renderSuccessView}
          {renderErrorView}
          {renderActivityStatusView}
        </View>
      </View>
    </Screen>
  )
}

export default withMyLnUpdateSub(RedeemBitcoinResultScreen)

const useStyles = makeStyles(({ colors }) => ({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    marginLeft: 20,
    marginRight: 20,
  },
  inputForm: {
    marginVertical: 20,
  },
  currencyInputContainer: {
    padding: 10,
    marginTop: 10,
    backgroundColor: colors.grey5,
    borderRadius: 10,
  },
  withdrawableDescriptionText: {
    textAlign: "center",
  },
  qr: {
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
  },
}))
