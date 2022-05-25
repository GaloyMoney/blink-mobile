import useMainQuery from "@app/hooks/use-main-query"
import { IPaymentType } from "@app/utils/parsing"
import useToken from "@app/utils/use-token"
import React, { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import SendBitcoinAmount from "./send-bitcoin-amount"
import SendBitcoinConfirmation from "./send-bitcoin-confirmation"
import SendBitcoinDestination from "./send-bitcoin-destination"
import { useMySubscription } from "@app/hooks"
import SendBitcoinSuccess from "./send-bitcoin-success"
import {
  parsePaymentDestination,
  translateUnknown as translate,
  useDelayedQuery,
} from "@galoymoney/client"
import { palette } from "@app/theme"

const Status = {
  IDLE: "idle",
  LOADING: "loading",
  PENDING: "pending",
  SUCCESS: "success",
  ERROR: "error",
} as const

const Styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    padding: 10,
    flex: 6,
  },
  errorContainer: {
    margin: 20,
  },
  errorText: {
    color: palette.red,
    textAlign: "center",
  },
})

const SendBitcoin = ({ navigation, route }) => {
  const [step, setStep] = useState(1)
  const [destination, setDestination] = useState("")
  const [amount, setAmount] = useState(0)
  const [note, setNote] = useState("")
  const { defaultWallet, myPubKey, username: myUsername } = useMainQuery()
  const [fromWallet, setFromWallet] = useState(defaultWallet)
  const [amountCurrency, setAmountCurrency] = useState("USD")
  const [fixedAmount, setFixedAmount] = useState(false)
  const [sameNode, setSameNode] = useState(false)
  const [paymentType, setPaymentType] = useState<IPaymentType>(undefined)
  const { tokenNetwork } = useToken()
  const [defaultAmount, setDefaultAmount] = useState(0)
  const { convertCurrencyAmount } = useMySubscription()
  const [inputError, setInputError] = useState(undefined)
  const [status, setStatus] = useState<
    "idle" | "loading" | "pending" | "success" | "error"
  >(Status.IDLE)
  const [recipientWalletId, setRecipientWalletId] = useState<string | undefined>(
    undefined,
  )

  const nextStep = () => setStep(step + 1)

  const [userDefaultWalletIdQuery, { loading: userDefaultWalletIdLoading }] =
    useDelayedQuery.userDefaultWalletId()

  const validateDestination = React.useCallback(async () => {
    if (userDefaultWalletIdLoading) {
      return false
    }

    setInputError(undefined)

    const {
      valid,
      errorMessage,

      paymentType,
      address,
      paymentRequest,
      handle,

      amount: amountInvoice,
      memo: memoInvoice,
      sameNode,
      // staticLnurlIdentifier,
    } = parsePaymentDestination({ destination, network: tokenNetwork, pubKey: myPubKey })

    if (destination === myUsername) {
      return false
    }

    const fixedAmount = amountInvoice !== undefined

    const staticLnurlIdentifier = false // FIXME: Change galoy-client to return this

    setPaymentType(paymentType)

    if (valid) {
      if (paymentType === "onchain") setDestination(address)
      if (paymentType === "lightning") setDestination(paymentRequest)

      if (paymentType === "intraledger") {
        const { data, errorsMessage } = await userDefaultWalletIdQuery({
          username: handle,
        })
        if (errorsMessage) {
          return false
        }
        setDestination(handle)
        setRecipientWalletId(data?.userDefaultWalletId)
      }

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

      setFixedAmount(fixedAmount)
      if (fixedAmount && !staticLnurlIdentifier) {
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
      setInputError(errorMessage)
      setDestination(destination)
    }

    return valid
  }, [
    convertCurrencyAmount,
    destination,
    myPubKey,
    myUsername,
    note,
    tokenNetwork,
    userDefaultWalletIdLoading,
    userDefaultWalletIdQuery,
  ])

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
      {inputError && (
        <View style={Styles.errorContainer}>
          <Text style={Styles.errorText}>{translate("Invalid Payment Destination")}</Text>
        </View>
      )}

      {step === 1 && (
        <SendBitcoinDestination
          destination={destination}
          setDestination={setDestination}
          validateDestination={validateDestination}
          nextStep={nextStep}
          navigation={navigation}
        />
      )}
      {step === 2 && (
        <SendBitcoinAmount
          nextStep={nextStep}
          defaultWallet={defaultWallet}
          fromWallet={fromWallet}
          setFromWallet={setFromWallet}
          note={note}
          setNote={setNote}
          amountCurrency={amountCurrency}
          toggleAmountCurrency={toggleAmountCurrency}
          setAmount={setAmount}
          defaultAmount={defaultAmount}
          fixedAmount={fixedAmount}
          walletPickerEnabled={paymentType !== "onchain"}
        />
      )}
      {step === 3 && (
        <SendBitcoinConfirmation
          destination={destination}
          recipientWalletId={recipientWalletId}
          wallet={fromWallet}
          amount={amount}
          amountCurrency={amountCurrency}
          note={note}
          setStatus={setStatus}
          fixedAmount={fixedAmount}
          paymentType={paymentType}
          sameNode={sameNode}
        />
      )}
      {step === 4 && <SendBitcoinSuccess />}
    </View>
  )
}

export default SendBitcoin
