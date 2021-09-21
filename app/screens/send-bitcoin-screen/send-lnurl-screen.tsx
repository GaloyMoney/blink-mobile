import React, { useEffect, useState } from "react"
import { gql, useApolloClient, useMutation, useLazyQuery } from "@apollo/client"
import { Alert, ScrollView, Text, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Button, Input } from "react-native-elements"
import LottieView from "lottie-react-native"
import EStyleSheet from "react-native-extended-stylesheet"

import errorLottie from "./error_lottie.json"
import successLottie from "./success_lottie.json"

import { Screen } from "../../components/screen"
import { InputPayment } from "../../components/input-payment"
import { PAYMENT_STATUS } from "../../constants/lnurl"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { balanceBtc, QUERY_TRANSACTIONS } from "../../graphql/query"
import {
  invoiceRequest,
  isAmountValid,
  isProtocolSupported,
  parseUrl,
} from "../../utils/lnurl"
import { mSatToSat } from "../../utils/amount"
import { useMoneyAmount, useBTCPrice, useCurrencies } from "../../hooks"

const PAY_INVOICE = gql`
  mutation payInvoice($invoice: String!, $amount: Int, $memo: String) {
    invoice {
      payInvoice(invoice: $invoice, amount: $amount, memo: $memo)
    }
  }
`

const styles = EStyleSheet.create({
  animationContainer: { alignItems: "center" },
  buttonContainerStyle: {
    flex: 1,
  },
  buttonStyle: {
    backgroundColor: color.primary,
    marginBottom: 32,
    marginHorizontal: 24,
    marginTop: 32,
  },
  description: {
    marginTop: 10,
  },
  errorContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  errorText: {
    color: palette.red,
    fontSize: 18,
  },
  lottie: {
    height: "200rem",
    width: "200rem",
  },
  memoContainer: {
    marginLeft: "-11rem",
    marginVertical: 12,
  },
  memoInput: {
    fontSize: 14,
  },
  memoLabel: {
    color: palette.midGrey,
    fontSize: 14,
    fontWeight: "normal",
    marginBottom: "3rem",
    marginLeft: "1rem",
  },

  scroll: {
    justifyContent: "space-between",
  },
  section: {
    alignItems: "center",
    marginHorizontal: 48,
  },

  successText: {
    fontSize: 18,
  },

  transactionDetailView: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginHorizontal: "24rem",
    marginVertical: "24rem",
  },
})

type Props = {
  route: {
    params: {
      invoice: string
    }
  }
}

const rowStyles = EStyleSheet.create({
  description: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 12,
    minWidth: "48%",
  },

  entry: {
    color: palette.midGrey,
    marginBottom: "6rem",
  },

  value: {
    color: palette.darkGrey,
    fontSize: "14rem",
    fontWeight: "bold",
  },
})

type RowProps = {
  entry: string
  value: string
}

export const Row = ({ entry, value }: RowProps): JSX.Element => {
  return (
    <View style={rowStyles.description}>
      <Text style={rowStyles.entry}>{entry}</Text>
      <Text selectable style={rowStyles.value}>
        {value}
      </Text>
    </View>
  )
}

export const SendLNUrlScreen: React.FC<Props> = ({ route }: Props) => {
  const { navigate } = useNavigation()
  const client = useApolloClient()
  const balance = balanceBtc(client)

  const btcPrice = useBTCPrice()
  const { primaryCurrency, secondaryCurrency, toggleCurrency } = useCurrencies()
  const [primaryAmount, convertPrimaryAmount, setPrimaryAmount, setPrimaryAmountValue] =
    useMoneyAmount(secondaryCurrency)

  const [
    secondaryAmount,
    convertSecondaryAmount,
    setSecondaryAmount,
    setSecondaryAmountValue,
  ] = useMoneyAmount(secondaryCurrency)

  const [amount, setAmount] = useState(0)
  const [status, setStatus] = useState(PAYMENT_STATUS.Pending)
  const [submitStatus, setSubmitStatus] = useState(0)
  const [callback, setCallback] = useState("")
  const [minSendable, setMinSendable] = useState(null)
  const [maxSendable, setMaxSendable] = useState(null)
  const [description, setDescription] = useState("")
  const [memo, setMemo] = useState("")
  const [maxMemoSize, setMaxMemoSize] = useState(0)

  const [queryTransactions] = useLazyQuery(QUERY_TRANSACTIONS, {
    fetchPolicy: "network-only",
  })

  const [payInvoice] = useMutation(PAY_INVOICE, {
    update: () => queryTransactions(),
  })

  const hasEnoughBalance = balance >= amount
  const isAmountSendable = isAmountValid(amount, minSendable, maxSendable)

  useEffect(() => {
    const parseInitialInvoice = async () => {
      const lnurl = await parseUrl(route.params.invoice)
      const { tag, callback, minSendable, maxSendable, commentAllowed, metadata } = lnurl

      if (!isProtocolSupported(tag)) {
        Alert.alert("LNUrl protocol not supported")
        throw new Error("LNURL protocol not supported")
      }

      setAmount(mSatToSat(minSendable))
      setPrimaryAmountValue(mSatToSat(minSendable))
      setSecondaryAmountValue(mSatToSat(minSendable))
      setCallback(callback)
      setMinSendable(mSatToSat(minSendable))
      setMaxSendable(mSatToSat(maxSendable))
      setMaxMemoSize(commentAllowed)

      try {
        const description = JSON.parse(metadata)[0][1]
        setDescription(description)
      } catch (error) {
        setDescription("Invoice description not recognized")
      }
    }

    parseInitialInvoice()
  }, [route.params.invoice, setPrimaryAmountValue, setSecondaryAmountValue])

  const submitPayment = async () => {
    setSubmitStatus(1)

    try {
      const paymentInvoice = await invoiceRequest(callback, amount, memo)
      const payment = await payInvoice({
        variables: { invoice: paymentInvoice, memo: description },
      })
      const { data } = payment

      setSubmitStatus(0)

      if (
        data.invoice.payInvoice === "success" ||
        data.invoice.payInvoice === "pending"
      ) {
        setStatus(PAYMENT_STATUS.Success)
      } else {
        setStatus(PAYMENT_STATUS.Error)
      }
    } catch (error) {
      setSubmitStatus(0)
      setStatus(PAYMENT_STATUS.Error)
    } finally {
      setTimeout(() => {
        setStatus(PAYMENT_STATUS.Finished)
      }, 4000)
    }
  }

  return (
    <Screen preset="fixed">
      <ScrollView style={styles.mainView} contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <InputPayment
            editable={true}
            onUpdateAmount={(input) => {
              setAmount(input)
            }}
            forceKeyboard
            price={btcPrice}
            primaryAmount={primaryAmount}
            secondaryAmount={secondaryAmount}
          />

          <View style={styles.errorContainer}>
            {!hasEnoughBalance && <Text>You do not have enough sats</Text>}
          </View>
        </View>
        <View style={styles.transactionDetailView}>
          <Text>
            Please pay between{" "}
            {minSendable === null ? "Loading..." : `${minSendable.toString()} sats`}
            {" and "}{" "}
            {maxSendable === null ? "Loading..." : `${maxSendable.toString()} sats`}
          </Text>

          <Text style={styles.description}>Description: </Text>
          <Text selectable style={rowStyles.value}>
            {description}
          </Text>

          {!(maxMemoSize === 0) && (
            <Input
              label="Memo"
              labelStyle={styles.memoLabel}
              inputStyle={styles.memoInput}
              maxLength={maxMemoSize}
              placeholder="Insert a memo"
              containerStyle={styles.memoContainer}
              onChangeText={setMemo}
            />
          )}
        </View>
        <View style={styles.animationContainer}>
          {status === PAYMENT_STATUS.Success && (
            <>
              <LottieView
                source={successLottie}
                loop={false}
                autoPlay
                style={styles.lottie}
                resizeMode="cover"
              />
              <Text style={styles.successText}>{"Success"}</Text>
            </>
          )}

          {status === PAYMENT_STATUS.Error && (
            <>
              <LottieView
                source={errorLottie}
                loop={false}
                autoPlay
                style={styles.lottie}
                resizeMode="cover"
              />
              <Text style={styles.errorText}>{"Payment error"}</Text>
            </>
          )}
        </View>
        <Button
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          title={status === PAYMENT_STATUS.Pending ? "Send" : "Close"}
          onPress={() =>
            status === PAYMENT_STATUS.Pending ? submitPayment() : navigate("Primary")
          }
          loading={submitStatus === 1}
          disabled={!amount || !hasEnoughBalance || !isAmountSendable}
        />
      </ScrollView>
    </Screen>
  )
}
