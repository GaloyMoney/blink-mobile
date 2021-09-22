import React, { useEffect, useState } from "react"
import { gql, useApolloClient, useMutation, useLazyQuery } from "@apollo/client"
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Button, Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"

import { Screen } from "../../components/screen"
import { InputPayment } from "../../components/input-payment"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { balanceBtc, queryWallet, QUERY_TRANSACTIONS } from "../../graphql/query"
import {
  invoiceRequest,
  isAmountValid,
  isProtocolSupported,
  parseUrl,
} from "../../utils/lnurl"
import { mSatToSat } from "../../utils/amount"
import { useMoneyAmount, useBTCPrice } from "../../hooks"
import { PaymentStatusIndicator } from "./payment-status-indicator"
import { translate } from "../../i18n/translate"

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
  value: {
    color: palette.darkGrey,
    fontSize: "14rem",
    fontWeight: "bold",
  },
})

const Status = {
  IDLE: "idle",
  LOADING: "loading",
  PENDING: "pending",
  SUCCESS: "success",
  ERROR: "error",
} as const

type StatusType = typeof Status[keyof typeof Status]

export const SendLNUrlScreen: React.FC<Props> = ({ route }: Props) => {
  const { navigate } = useNavigation()
  const client = useApolloClient()
  const balance = balanceBtc(client)

  const btcPrice = useBTCPrice()

  // Disabling becuase useMoneyAmount exports values as an array instead of an object so I need to take everything in order.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [primaryAmount, convertPrimaryAmount, setPrimaryAmount, setPrimaryAmountValue] =
    useMoneyAmount("BTC")

  const [status, setStatus] = useState<StatusType>(Status.IDLE)
  const [errs, setErrs] = useState<{ message: string }[]>([])
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

  useEffect(() => {
    const parseInitialInvoice = async () => {
      const lnurl = await parseUrl(route.params.invoice)
      const { tag, callback, minSendable, maxSendable, commentAllowed, metadata } = lnurl

      if (!isProtocolSupported(tag)) {
        Alert.alert("LNUrl protocol not supported")
        throw new Error("LNURL protocol not supported")
      }

      setPrimaryAmountValue(mSatToSat(minSendable))
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
  }, [route.params.invoice, setPrimaryAmountValue])

  const hasEnoughBalance = balance >= primaryAmount.value
  const isAmountSendable = isAmountValid(primaryAmount.value, minSendable, maxSendable)

  const submitPayment = async () => {
    setSubmitStatus(1)

    try {
      const paymentInvoice = await invoiceRequest(callback, primaryAmount.value, memo)
      const payment = await payInvoice({
        variables: { invoice: paymentInvoice, memo: description },
      })
      const { data } = payment

      setSubmitStatus(0)
      if (data.invoice.payInvoice === "success") {
        setStatus(Status.SUCCESS)
        queryWallet(client, "network-only")
      } else if (data.invoice.payInvoice === "pending") {
        setStatus(Status.PENDING)
      } else {
        setStatus(Status.ERROR)
      }
    } catch (error) {
      setErrs(error)
      setSubmitStatus(0)
      setStatus(Status.ERROR)
    } finally {
      setTimeout(() => {
        navigate("Primary")
      }, 4000)
    }
  }

  const PayText = () => {
    if (!minSendable || !maxSendable) {
      return <ActivityIndicator size="small" />
    }
    return <Text>{`Please pay between ${minSendable} and ${maxSendable}`}</Text>
  }

  return (
    <Screen preset="fixed">
      <ScrollView style={styles.mainView} contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <InputPayment
            editable={true}
            onUpdateAmount={setPrimaryAmountValue}
            forceKeyboard
            price={btcPrice}
            primaryAmount={primaryAmount}
          />

          <View style={styles.errorContainer}>
            {!hasEnoughBalance && <Text>{translate("LNUrlScreen.balance")}</Text>}
          </View>
        </View>
        <View style={styles.transactionDetailView}>
          <PayText />

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
          <PaymentStatusIndicator errs={errs} status={status} />
        </View>
        <Button
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          title={status === Status.IDLE ? "Send" : "Close"}
          onPress={() => (status === Status.IDLE ? submitPayment() : navigate("Primary"))}
          loading={submitStatus === 1}
          disabled={!primaryAmount.value || !hasEnoughBalance || !isAmountSendable}
        />
      </ScrollView>
    </Screen>
  )
}
