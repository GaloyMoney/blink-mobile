import useMainQuery from "@app/hooks/use-main-query"
import { IPaymentType, validPayment } from "@app/utils/parsing"
import useToken from "@app/utils/use-token"
import React, { useCallback, useEffect, useState } from "react"
import { StyleSheet, TextInput, View } from "react-native"
import SendBitcoinAmount from "./send-bitcoin-amount"
import SendBitcoinConfirmation from "./send-bitcoin-confirmation"
import SendBitcoinDestination from "./send-bitcoin-destination"
import * as UsernameValidation from "../../utils/validation"
import { debounce } from "lodash"
import { gql, useLazyQuery } from "@apollo/client"
import { useMySubscription } from "@app/hooks"
import SendBitcoinSuccess from "./send-bitcoin-success"

const Status = {
  IDLE: "idle",
  LOADING: "loading",
  PENDING: "pending",
  SUCCESS: "success",
  ERROR: "error",
} as const

const USER_WALLET_ID = gql`
  query userDefaultWalletId($username: Username!) {
    userDefaultWalletId(username: $username)
  }
`

const Styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    padding: 10,
    flex: 6,
  },
})

const SendBitcoin = ({ navigation, route }) => {
  console.log(route)
  const [step, setStep] = useState(1)
  const [destination, setDestination] = useState("")
  const [amount, setAmount] = useState(0)
  const [note, setNote] = useState("")
  const { defaultWallet, myPubKey, username: myUsername } = useMainQuery()
  const [fromWallet, setFromWallet] = useState(defaultWallet)
  const [amountCurrency, setAmountCurrency] = useState("USD")
  const [amountless, setAmountless] = useState(false)
  const [sameNode, setSameNode] = useState(false)
  const [paymentType, setPaymentType] = useState<IPaymentType>(undefined)
  const { tokenNetwork } = useToken()
  const [defaultAmount, setDefaultAmount] = useState(0)
  const { convertCurrencyAmount } = useMySubscription()
  const [invoiceError, setInvoiceError] = useState(undefined)
  const [destinationStatus, setDestinationStatus] = useState<
    "VALID" | "INVALID" | "NOT_CHECKED"
  >("NOT_CHECKED")
  const [status, setStatus] = useState<StatusType>(Status.IDLE)
  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const [
    userDefaultWalletIdQuery,
    { loading: loadingUserDefaultWalletId, data: dataUserDefaultWalletId },
  ] = useLazyQuery(USER_WALLET_ID, {
    fetchPolicy: "network-only",
    onCompleted: (dataUserDefaultWalletId) => {
      if (dataUserDefaultWalletId?.userDefaultWalletId) {
        setDestinationStatus("VALID")
      }
    },
    onError: () => {
      setDestinationStatus("INVALID")
    },
  })

  const userDefaultWalletIdQueryDebounced = useCallback(
    debounce(async (destination) => {
      userDefaultWalletIdQuery({ variables: { username: destination } })
    }, 1500),
    [],
  )

  useEffect(() => {
    const {
      valid,
      errorMessage,
      invoice,
      amount: amountInvoice,
      amountless,
      memo: memoInvoice,
      paymentType,
      address,
      lnurl,
      sameNode,
      staticLnurlIdentifier,
    } = validPayment(destination, tokenNetwork, myPubKey, myUsername)

    if (valid) {
      if (paymentType === "onchain") setDestination(address)
      if (paymentType === "lightning") setDestination(invoice)
      setPaymentType(paymentType)

      //   if (lnurl) {
      //     setPaymentType("lnurl")
      //     if (staticLnurlIdentifier) {
      //       setIsStaticLnurlIdentifier(true)
      //       setInteractive(true)
      //     }
      //     if (route.params?.lnurlParams) {
      //       const params = setLnurlParams({ params: route.params.lnurlParams, lnurl })
      //       setLnurlPay({ ...params })
      //     } else {
      //       debouncedGetLnurlParams(lnurl)
      //     }
      //   }
      setAmountless(amountless)
      if (!amountless && !staticLnurlIdentifier) {
        setDefaultAmount(
          convertCurrencyAmount({
            from: "BTC",
            to: "USD",
            amount: amountInvoice,
          }),
        )
      }

      if (!note && memoInvoice) {
        setNote(memoInvoice.toString())
      }
      setSameNode(sameNode)
    } else if (errorMessage) {
      setPaymentType(paymentType)
      setInvoiceError(errorMessage)
      setDestination(destination)
    } else {
      setPaymentType("username")

      if (UsernameValidation.isValid(destination)) {
        userDefaultWalletIdQueryDebounced(destination)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination])

  useEffect(() => {
    if (route.params?.payment) {
      setDestination(route.params?.payment)
    }
  }, [route.params?.payment])

  const toggleAmountCurrency = () => {
    if (amountCurrency === "USD") {
      setAmountCurrency("BTC")
    }
    if (amountCurrency === "BTC") {
      setAmountCurrency("USD")
    }
  }

  useEffect(() => {
    if (status === Status.SUCCESS) {
      setStep(4)
    }
  }, [status])

  return (
    <View style={Styles.container}>
      {step === 1 && (
        <SendBitcoinDestination
          destination={destination}
          setDestination={setDestination}
          nextStep={nextStep}
          navigation={navigation}
        />
      )}
      {step === 2 && (
        <SendBitcoinAmount
          nextStep={nextStep}
          prevStep={prevStep}
          defaultWallet={defaultWallet}
          fromWallet={fromWallet}
          setFromWallet={setFromWallet}
          note={note}
          setNote={setNote}
          amountCurrency={amountCurrency}
          toggleAmountCurrency={toggleAmountCurrency}
          setAmount={setAmount}
          defaultAmount={defaultAmount}
          amountless={amountless}
        />
      )}
      {step === 3 && (
        <SendBitcoinConfirmation
          destination={destination}
          wallet={fromWallet}
          amount={amount}
          amountCurrency={amountCurrency}
          note={note}
          setStatus={setStatus}
          amountless={amountless}
          paymentType={paymentType}
          sameNode={sameNode}
        />
      )}
      {step === 4 && <SendBitcoinSuccess />}
    </View>
  )
}

export default SendBitcoin
