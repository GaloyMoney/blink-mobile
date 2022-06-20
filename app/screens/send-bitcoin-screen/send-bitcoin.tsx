import useMainQuery from "@app/hooks/use-main-query"
import React, { useCallback, useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import SendBitcoinAmount from "./send-bitcoin-amount"
import SendBitcoinConfirmation from "./send-bitcoin-confirmation"
import SendBitcoinDestination from "./send-bitcoin-destination"
import SendBitcoinSuccess from "./send-bitcoin-success"
import { palette } from "@app/theme"
import { WalletCurrency } from "@app/types/amounts"
import { PaymentType } from "@galoymoney/client"
import { Status } from "./send-bitcoin.types"
import { LnUrlPayServiceResponse } from "lnurl-pay/dist/types/types"

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

const domains = [
  "https://ln.bitcoinbeach.com/",
  "https://pay.mainnet.galoy.io/",
  "https://pay.bbw.sv/",
]

const SendBitcoin = ({ navigation, route }) => {
  const { defaultWallet, usdWalletId } = useMainQuery()

  const [status, setStatus] = useState<Status>(Status.IDLE)
  const [step, setStep] = useState(1)
  const [destination, setDestination] = useState("")
  const [amount, setAmount] = useState(0)
  const [note, setNote] = useState("")
  const [fromWallet, setFromWallet] = useState(defaultWallet)
  const [amountCurrency, setAmountCurrency] = useState("USD")
  const [fixedAmount, setFixedAmount] = useState(false)
  const [sameNode, setSameNode] = useState(false)
  const [paymentType, setPaymentType] = useState<PaymentType>(undefined)
  const [defaultAmount, setDefaultAmount] = useState(0)
  const [lnurlParams, setLnurlParams] = useState<LnUrlPayServiceResponse>()
  const [lnurlInvoice, setLnurlInvoice] = useState("")
  const [recipientWalletId, setRecipientWalletId] = useState<string | undefined>(
    undefined,
  )

  const nextStep = useCallback(
    (parsedDestination?) => {
      if (parsedDestination) {
        setPaymentType(parsedDestination.paymentType)
        setSameNode(parsedDestination.sameNode)
        setFixedAmount(parsedDestination.fixedAmount)
        if (parsedDestination.lnurlParams && !parsedDestination.sameNode) {
          setLnurlParams(parsedDestination.lnurlParams)
        }
        if (parsedDestination.defaultAmount !== undefined) {
          setDefaultAmount(parsedDestination.defaultAmount)
        }
        if (parsedDestination.note !== undefined) {
          setNote(parsedDestination.note)
        }
        if (parsedDestination.recipientWalletId !== undefined) {
          setRecipientWalletId(parsedDestination.recipientWalletId)
        }
      }

      setStep(step + 1)
    },
    [step],
  )

  useEffect(() => {
    if (status === Status.SUCCESS) {
      setStep(4)
    }
  }, [status])

  useEffect(() => {
    if (route.params?.payment) {
      if (route.params.payment.startsWith("https://")) {
        domains.forEach((domain) => {
          if (route.params?.payment?.startsWith(domain)) {
            setDestination(route.params?.payment?.substring(domain.length))
          }
        })
      } else {
        setDestination(route.params?.payment)
      }
    }
  }, [route.params?.payment])

  useEffect(() => {
    if (route.params?.username) {
      setDestination(route.params?.username)
    }
  }, [route.params?.username])

  const toggleAmountCurrency = useCallback(() => {
    if (amountCurrency === "USD") {
      setAmountCurrency("BTC")
    }
    if (amountCurrency === "BTC") {
      setAmountCurrency("USD")
    }
  }, [amountCurrency])

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
          usdDisabled={paymentType === "onchain" || usdWalletId === undefined}
          lnurlParams={lnurlParams}
          paymentType={paymentType}
          setLnurlInvoice={setLnurlInvoice}
          setFixedAmount={setFixedAmount}
          destination={destination}
        />
      )}
      {step === 3 && (
        <SendBitcoinConfirmation
          destination={destination}
          recipientWalletId={recipientWalletId}
          wallet={fromWallet}
          paymentAmount={{
            amount: amountCurrency === WalletCurrency.USD ? amount * 100 : amount,
            currency: amountCurrency as WalletCurrency,
          }}
          note={note}
          setStatus={setStatus}
          isNoAmountInvoice={!fixedAmount}
          paymentType={paymentType}
          sameNode={sameNode}
          lnurlInvoice={lnurlInvoice}
        />
      )}
      {step === 4 && <SendBitcoinSuccess />}
    </View>
  )
}

export default SendBitcoin
