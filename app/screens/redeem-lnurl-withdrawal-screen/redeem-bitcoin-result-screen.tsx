import React, { useCallback, useEffect, useState } from "react"
import { View } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { makeStyles, Text } from "@rneui/themed"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import fetch from "cross-fetch"

// hooks
import { useI18nContext } from "@app/i18n/i18n-react"
import { useApolloClient } from "@apollo/client"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useActivityIndicator } from "@app/hooks"

// components
import { Screen } from "@app/components/screen"
import { ResultError, ResultSuccess } from "@app/components/redeem-flow"
import { withMyLnUpdateSub } from "../receive-bitcoin-screen/my-ln-updates-sub"

// gql
import {
  HomeAuthedDocument,
  LnInvoice,
  useLnUsdInvoiceCreateMutation,
  WalletCurrency,
} from "@app/graphql/generated"

// breez-sdk
import { onRedeem } from "@app/utils/breez-sdk-liquid"

type Prop = StackScreenProps<RootStackParamList, "redeemBitcoinResult">

const RedeemBitcoinResultScreen: React.FC<Prop> = ({ route, navigation }) => {
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
  const client = useApolloClient()
  const { LL } = useI18nContext()
  const { formatDisplayAndWalletAmount } = useDisplayCurrency()
  const { toggleActivityIndicator } = useActivityIndicator()

  const [lnUsdInvoiceCreate] = useLnUsdInvoiceCreateMutation()

  const [err, setErr] = useState("")
  const [withdrawalInvoice, setInvoice] = useState<LnInvoice>()
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (receivingWalletDescriptor.currency === WalletCurrency.Usd) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.usdTitle() })
    } else if (receivingWalletDescriptor.currency === WalletCurrency.Btc) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.title() })
    }
  }, [receivingWalletDescriptor.currency])

  useEffect(() => {
    if (!success && !err) {
      toggleActivityIndicator(true)
    } else {
      toggleActivityIndicator(false)
    }
  }, [success, err])

  useEffect(() => {
    if (success) {
      client.refetchQueries({ include: [HomeAuthedDocument] })
      const id = setTimeout(() => {
        navigation.popToTop()
      }, 5000)
      return () => clearTimeout(id)
    }
  }, [success])

  useEffect(() => {
    if (receivingWalletDescriptor.currency === "BTC") {
      redeemToBTCWallet()
    } else {
      if (withdrawalInvoice) {
        submitLNURLWithdrawRequest(withdrawalInvoice)
      } else {
        createWithdrawRequestInvoice(displayAmount.amount, defaultDescription)
      }
    }
  }, [withdrawalInvoice, displayAmount, lnurl])

  const createWithdrawRequestInvoice = useCallback(
    async (amount: number, memo: string) => {
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

        if (data) {
          const { lnUsdInvoiceCreate } = data
          if (lnUsdInvoiceCreate.invoice) {
            setInvoice(lnUsdInvoiceCreate.invoice)
          } else {
            console.error(lnUsdInvoiceCreate.errors, "error with lnInvoiceCreate")
            setErr(LL.RedeemBitcoinScreen.error())
          }
        }
      } catch (err) {
        console.error(err, "error with AddInvoice")
        setErr(`${err}`)
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
          setErr(lnurlResponse.reason || LL.RedeemBitcoinScreen.redeemingError())
        } else {
          setSuccess(true)
        }
      } else {
        const lnurlResponse = await result.json()
        console.error(lnurlResponse.reason, "error with submitting withdrawalRequest")
        setErr(LL.RedeemBitcoinScreen.submissionError() + `\n ${lnurlResponse.reason}`)
      }
    },
    [callback, LL, k1],
  )

  const redeemToBTCWallet = async () => {
    const res = await onRedeem(lnurl, defaultDescription)
    if (res.success) {
      setSuccess(true)
    } else {
      setErr(res.error || LL.RedeemBitcoinScreen.redeemingError())
    }
  }

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
        <ResultError err={err} />
        <ResultSuccess success={success} />
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
  contentContainer: {
    padding: 20,
    flexGrow: 1,
  },
}))
