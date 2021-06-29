import React, { useEffect, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { gql, useApolloClient, useMutation } from "@apollo/client"
import { ScrollView, Text, View } from "react-native"
import { Button } from "react-native-elements"
import LottieView from "lottie-react-native"
import EStyleSheet from "react-native-extended-stylesheet"

const errorLottie = require("../move-money-screen/error_lottie.json")
const successLottie = require("../move-money-screen/success_lottie.json")

import { translate } from "../../i18n"
import { Screen } from "../../components/screen"
import { InputPayment } from "../../components/input-payment"
import { PAYMENT_STATUS } from "../../constants/lnurl"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { btc_price, balanceBtc } from "../../graphql/query"
import { usePrefCurrency } from "../../hooks/usePrefCurrency"
import { Row } from "../../components/shared/row"
import { lnUrlPay, parseUrl } from "../../utils/lnurl"

const LIGHTNING_FEES = gql`
  mutation lightning_fees($invoice: String, $amount: Int) {
    invoice {
      getFee(invoice: $invoice, amount: $amount)
    }
  }
`

const PAY_INVOICE = gql`
  mutation payInvoice($invoice: String!, $amount: Int, $memo: String) {
    invoice {
      payInvoice(invoice: $invoice, amount: $amount, memo: $memo)
    }
  }
`

const lnurlI =
  "LNURL1DP68GURN8GHJ7MRWW4EXCTNXD9SHG6NPVCHXXMMD9AKXUATJDSKHQCTE8AEK2UMND9HKU0TXVS6X2C3EXUUKVC35XPJKGDNXXQCNQCM9XAJRWVRXV33NJWRXVVERGERPV5UXVCEEXYEKVWF3XQEK2DFEXV6XYCF4VCENZDF4XY6NWEJ89Y7"

const styles = EStyleSheet.create({
  buttonContainerStyle: {
    flex: 1,
  },
  buttonStyle: {
    backgroundColor: color.primary,
    marginBottom: 32,
    marginHorizontal: 24,
    marginTop: 32,
  },
  errorText: {
    color: palette.red,
    fontSize: 18,
  },
  lottie: {
    height: "200rem",
    width: "200rem",
  },
  scroll: {
    justifyContent: "space-between",
  },
  section: {
    marginHorizontal: 48,
  },
  successText: {
    fontSize: 18,
  },
  transactionDetailView: {
    marginHorizontal: "24rem",
    marginVertical: "24rem",
  },
})

export const SendLNUrlScreen = () => {
  const { goBack } = useNavigation()
  const client = useApolloClient()
  const price = btc_price(client)
  const balance = balanceBtc(client)

  const [fees, setFees] = useState(null)
  const [amount, setAmount] = useState(0)
  const [status, setStatus] = useState(PAYMENT_STATUS.Pending)
  const [invoice, setInvoice] = useState("")
  const [submitStatus, setSubmitStatus] = useState(0)
  const [callback, setCallback] = useState("")
  const [description, setDescription] = useState("")
  const [prefCurrency, nextPrefCurrency] = usePrefCurrency()

  const [lightningFees] = useMutation(LIGHTNING_FEES)
  const [payInvoice] = useMutation(PAY_INVOICE)

  const hasEnoughBalance = balance >= amount

  useEffect(() => {
    const initialInvoiceParse = async () => {
      const lnurlInvoice = await lnUrlPay(lnurlI, 8000)
      console.log(lnurlInvoice)
    }

    const getFees = async () => {
      const fees = await lightningFees({ variables: { invoice } })
      const {
        data: {
          invoice: { getFee },
        },
      } = fees
      setFees(getFee)
    }

    initialInvoiceParse()
  }, [])

  const submitPayment = async () => {
    setSubmitStatus(1)

    try {
      const payment = await payInvoice({ variables: { invoice } })
      const { data } = payment

      setSubmitStatus(0)

      if (data.invoice === "success") {
        setStatus(PAYMENT_STATUS.Success)
      } else {
        setStatus(PAYMENT_STATUS.Error)
      }
    } catch (error) {
      setSubmitStatus(0)
      setStatus(PAYMENT_STATUS.Error)
    }
  }

  return (
    <Screen preset="fixed">
      <ScrollView style={styles.mainView} contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <InputPayment
            prefCurrency={prefCurrency}
            nextPrefCurrency={nextPrefCurrency}
            initAmount={amount}
            editable={true}
            onUpdateAmount={(input) => {
              setAmount(input)
            }}
            forceKeyboard
            price={price}
          />
          {amount > balance && <Text>You cant send</Text>}
        </View>
        <View style={styles.transactionDetailView}>
          <Row entry="Fees" value={fees === null ? "Loading fees" : fees} />
          <Row entry="Description" value="This is the invoice description" />
        </View>

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
        <Button
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          title={"Send"}
          onPress={submitPayment}
          loading={submitStatus === 1}
          disabled={!amount || !hasEnoughBalance}
        />
      </ScrollView>
    </Screen>
  )
}
