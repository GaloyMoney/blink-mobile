/* eslint-disable react-native/no-inline-styles */
import { gql, useApolloClient, useLazyQuery } from "@apollo/client"
import { StackNavigationProp } from "@react-navigation/stack"
import { RouteProp } from "@react-navigation/native"
import * as React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ActivityIndicator, ScrollView, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import debounce from "lodash.debounce"
import { getParams } from 'js-lnurl'

import { InputPayment } from "../../components/input-payment"
import { GaloyInput } from "../../components/galoy-input"
import { Screen } from "../../components/screen"
import { useMoneyAmount, useWalletBalance } from "../../hooks"
import { translate } from "../../i18n"
import type { MoveMoneyStackParamList } from "../../navigation/stack-param-lists"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import type { ScreenType } from "../../types/jsx"
import { IPaymentType, validPayment } from "../../utils/parsing"
import useToken from "../../utils/use-token"
import { UsernameValidation } from "../../utils/validation"
import { TextCurrency } from "../../components/text-currency/text-currency"
import { useMyCurrencies, useMySubscription } from "../../hooks/user-hooks"
import { toastShow } from "../../utils/toast"

export const PRICE_CHECK_INTERVAL = 10000

const USER_WALLET_ID = gql`
  query userDefaultWalletId($username: Username!) {
    userDefaultWalletId(username: $username)
  }
`

type SendBitcoinScreenProps = {
  navigation: StackNavigationProp<MoveMoneyStackParamList, "sendBitcoin">
  route: RouteProp<MoveMoneyStackParamList, "sendBitcoin">
}

export const SendBitcoinScreen: ScreenType = ({
  navigation,
  route,
}: SendBitcoinScreenProps) => {
  const client = useApolloClient()
  const { tokenNetwork } = useToken()

  const { formatCurrencyAmount } = useMySubscription()
  const { satBalance } = useWalletBalance()
  const { primaryCurrency, secondaryCurrency, toggleCurrency } = useMyCurrencies()
  const [primaryAmount, convertPrimaryAmount, setPrimaryAmount, setPrimaryAmountValue] =
    useMoneyAmount(primaryCurrency)
  const [
    secondaryAmount,
    convertSecondaryAmount,
    setSecondaryAmount,
    setSecondaryAmountValue,
  ] = useMoneyAmount(secondaryCurrency)

  const [invoiceError, setInvoiceError] = useState("")
  const [address, setAddress] = useState("")
  const [lnurl] = useState("")
  const [minSendable, setMinSendable] = useState("")
  const [maxSendable, setMaxSendable] = useState("")
  const [lnurlDomain, setLnurlDomain] = useState("domain")
  const [lnurlCb, setLnurlCb] = useState("")

  const [paymentType, setPaymentType] = useState<IPaymentType>(undefined)
  const [amountless, setAmountless] = useState(false)
  const [destination, setDestinationInternal] = useState("")
  const [destinationStatus, setDestinationStatus] = useState<
    "VALID" | "INVAILD" | "NOT_CHECKED"
  >("NOT_CHECKED")
  const [invoice, setInvoice] = useState("")
  const [memo, setMemo] = useState<string>("")
  const [sameNode, setSameNode] = useState<boolean | null>(null)
  const [interactive, setInteractive] = useState(false)

  const satAmount =
    primaryCurrency === "BTC" ? primaryAmount.value : secondaryAmount.value

  const referenceAmount: MoneyAmount = useMemo(() => {
    if ((paymentType === "onchain" || paymentType === "lightning") && !amountless) {
      return {
        value: satAmount,
        currency: "BTC",
      }
    }
    return primaryAmount
  }, [amountless, paymentType, primaryAmount, satAmount])

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
      setDestinationStatus("INVAILD")
    },
  })

  const setDestination = (input) => setDestinationInternal(input.trim())

  const reset = useCallback(() => {
    setInvoiceError("")
    setAddress("")
    setPaymentType(undefined)
    setAmountless(false)
    setPrimaryAmountValue(0)
    setDestination("")
    setInvoice("")
    setMemo("")
    setInteractive(true)
  }, [setPrimaryAmountValue])

  useEffect(() => {
    if (primaryCurrency !== primaryAmount.currency) {
      const tempAmount = { ...secondaryAmount }
      setSecondaryAmount(primaryAmount)
      setPrimaryAmount(tempAmount)
    }
  }, [
    primaryCurrency,
    primaryAmount,
    secondaryAmount,
    setPrimaryAmount,
    setSecondaryAmount,
  ])

  useEffect(() => {
    reset()
    const { valid, username } = validPayment(route.params?.payment, tokenNetwork, client)
    if (route.params?.username || username) {
      setInteractive(false)
      setDestination(route.params?.username || username)
    } else if (valid) {
      setInteractive(false)
      setDestination(route.params?.payment)
    } else {
      setInteractive(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, tokenNetwork, route.params])

  useEffect(() => {
    if ((paymentType !== "onchain" && paymentType !== "lightning") || amountless) {
      convertSecondaryAmount(primaryAmount)
    }
  }, [amountless, convertSecondaryAmount, paymentType, primaryAmount])

  useEffect(() => {
    // Update the USD amount (which could be primary or secondary) based on a new price from the API
    if (
      (paymentType === "onchain" || paymentType === "lightning") &&
      !amountless &&
      satAmount !== 0
    ) {
      if (primaryAmount.currency === "BTC") {
        setPrimaryAmountValue(satAmount)
      } else {
        convertPrimaryAmount({
          value: satAmount,
          currency: "BTC",
        })
      }
    }
  }, [
    amountless,
    convertPrimaryAmount,
    paymentType,
    primaryAmount.currency,
    satAmount,
    setPrimaryAmountValue,
  ])

  const userDefaultWalletIdQueryDebounced = React.useMemo(
    () =>
      debounce(async () => {
        userDefaultWalletIdQuery({ variables: { username: destination } })
      }, 1000),
    [destination, userDefaultWalletIdQuery],
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
    } = validPayment(destination, tokenNetwork, client)

    if (valid) {
      setAddress(address)
      setPaymentType(paymentType)
      setInvoice(invoice)

      console.log('203 ', valid, address, invoice, lnurl, destination, paymentType)
      if (lnurl) {
        getParams(lnurl).then(params => {
          console.log('setMinSendable ', params.minSendable, ' sats')
          setMinSendable(params.minSendable/1000)
          setMaxSendable(params.maxSendable/1000)
          setLnurlDomain(params.domain)
          setLnurlCb(params.callback)
          setPaymentType("lnurl")
          console.log('minSendable ', minSendable, lnurlDomain, paymentType)
        })
      }
      setAmountless(amountless)

      if (!amountless) {
        const moneyAmount: MoneyAmount = { value: amountInvoice, currency: "BTC" }
        if (primaryCurrency === "BTC") {
          setPrimaryAmountValue(amountInvoice)
        } else {
          convertPrimaryAmount(moneyAmount)
          setSecondaryAmountValue(amountInvoice)
        }
      }

      if (!memo && memoInvoice) {
        setMemo(memoInvoice.toString())
      }

      setInteractive(false)
      setSameNode(sameNode)
    } else if (errorMessage) {
      setPaymentType(paymentType)
      setInvoiceError(errorMessage)
      setInvoice(destination)
    } else {
      setPaymentType("username")

      if (UsernameValidation.isValid(destination)) {
        userDefaultWalletIdQueryDebounced()
      }
    }
    return () => userDefaultWalletIdQueryDebounced.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination])

  const errorMessage = useMemo(() => {
    if (invoiceError) {
      return invoiceError
    } else if (!!satAmount && satBalance && satAmount > satBalance) {
      return translate("SendBitcoinScreen.amountExceed", {
        balance: formatCurrencyAmount({ sats: satBalance, currency: primaryCurrency }),
      })
    }
    return null
  }, [formatCurrencyAmount, invoiceError, primaryCurrency, satAmount, satBalance])

  useEffect(() => {
    setDestinationStatus("NOT_CHECKED")
  }, [destination])

  const pay = useCallback(() => {
    console.log('pay ', paymentType, primaryAmount)
    if (paymentType === "username" && destinationStatus !== "VALID") {
      userDefaultWalletIdQuery({ variables: { username: destination } })
      toastShow(translate("SendBitcoinScreen.usernameNotFound"))
      return
    } else if (paymentType == "lnurl") {
      const satAmount = primaryAmount.value * 1000
      console.log('preparing invoice ', `${lnurlCb}?amount=${satAmount}&comment=${memo}`)
      fetch(`${lnurlCb}?amount=${satAmount}&comment=${memo}`)
        .then(res => res.json())
        .then(res => {
          console.log('fetch res ', res)
          navigation.navigate("sendBitcoinConfirmation", {
            address,
            amountless,
            invoice: res.pr,
            memo,
            paymentType,
            primaryCurrency,
            referenceAmount,
            sameNode,
            username: null,
            recipientDefaultWalletId: null,
          })
        })
        .catch(error => {
          console.log('invoice fetch error ', error)
        })
    } else {
      navigation.navigate("sendBitcoinConfirmation", {
        address,
        amountless,
        invoice,
        memo,
        paymentType,
        primaryCurrency,
        referenceAmount,
        sameNode,
        username: paymentType === "username" ? destination : null,
        recipientDefaultWalletId:
          paymentType === "username" ? dataUserDefaultWalletId.userDefaultWalletId : null,
      })
    }
  }, [
    paymentType,
    destinationStatus,
    userDefaultWalletIdQuery,
    destination,
    navigation,
    address,
    amountless,
    invoice,
    lnurlCb,
    primaryAmount,
    memo,
    primaryCurrency,
    referenceAmount,
    sameNode,
    dataUserDefaultWalletId,
  ])

  return (
    <SendBitcoinScreenJSX
      paymentType={paymentType}
      amountless={amountless}
      setPrimaryAmountValue={setPrimaryAmountValue}
      invoice={invoice}
      address={address}
      lnurl={lnurl}
      minSendable={minSendable}
      maxSendable={maxSendable}
      lnurlDomain={lnurlDomain}
      memo={memo}
      pay={pay}
      primaryAmount={primaryAmount}
      secondaryAmount={secondaryAmount}
      navigation={navigation}
      toggleCurrency={toggleCurrency}
      setMemo={setMemo}
      setDestination={setDestination}
      destination={destination}
      destinationStatus={destinationStatus}
      loadingUserNameExist={loadingUserDefaultWalletId}
      interactive={interactive}
      errorMessage={errorMessage}
      reset={reset}
    />
  )
}

type SendBitcoinScreenJSXProps = {
  paymentType: string
  amountless: boolean
  setPrimaryAmountValue: (value: number) => void
  invoice: string
  address: string
  lnurl: string
  minSendable: string
  maxSendable: string
  lnurlDomain: string
  memo: string
  amount: number
  navigation: StackNavigationProp<MoveMoneyStackParamList, "sendBitcoin">
  toggleCurrency: () => void
  pay: () => void
  primaryAmount: MoneyAmount
  secondaryAmount: MoneyAmount
  setMemo: (memo: string) => void
  setDestination: (destination: string) => void
  destination: string
  destinationStatus: string
  loadingUserNameExist: boolean
  interactive: boolean
  errorMessage: string
  reset: () => void
}

export const SendBitcoinScreenJSX: ScreenType = ({
  paymentType,
  amountless,
  setPrimaryAmountValue,
  invoice,
  address,
  lnurl,
  minSendable,
  maxSendable,
  lnurlDomain,
  memo,
  navigation,
  toggleCurrency,
  pay,
  primaryAmount,
  secondaryAmount,
  setMemo,
  setDestination,
  destination,
  destinationStatus,
  loadingUserNameExist,
  interactive,
  errorMessage,
  reset,
}: SendBitcoinScreenJSXProps) => {
  // console.log('SendBitcoinScreenJSXProps ', lnurl, lnurlDomain, translate("common.domain"))
  const destinationInputRightIcon = () => {
    if (UsernameValidation.hasValidLength(destination) && paymentType === "username") {
      if (
        loadingUserNameExist ||
        (UsernameValidation.isValid(destination) && destinationStatus === "NOT_CHECKED") // The debounce delay
      ) {
        return <ActivityIndicator size="small" />
      } else if (
        UsernameValidation.isValid(destination) &&
        destinationStatus === "VALID"
      ) {
        return <Text>✅</Text>
      } else if (
        !UsernameValidation.isValid(destination) ||
        destinationStatus === "INVAILD"
      ) {
        return <Text>⚠️</Text>
      } else {
        return <Text></Text>
      }
    } else if (paymentType === "lightning" || paymentType === "onchain") {
      return <Icon name="ios-close-circle-outline" onPress={reset} size={30} />
    } else if (paymentType === "lnurl") {
      console.log('destinationInputRightIcon lnurl ', lnurl)
    } else if (destination.length === 0) {
      return (
        <Icon
          name="camera"
          onPress={() => navigation.navigate("scanningQRCode")}
          size={30}
        />
      )
    }

    return null
  }

  return (
    <Screen preset="fixed">
      <ScrollView
        style={styles.mainView}
        contentContainerStyle={{ justifyContent: "space-between" }}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.section}>
          <InputPayment
            editable={paymentType !== ("lightning" || "onchain") || amountless}
            forceKeyboard={navigation?.isFocused() ?? false}
            toggleCurrency={toggleCurrency}
            onUpdateAmount={setPrimaryAmountValue}
            primaryAmount={primaryAmount}
            secondaryAmount={secondaryAmount}
          />
          <TextCurrency
            amount={secondaryAmount.value}
            currency={secondaryAmount.currency}
            style={styles.subCurrencyText}
          />
          {minSendable !== "" && (
            <View style={styles.errorContainer}>
              <Text>Min: {minSendable} sats - Max: {maxSendable} sats</Text>
            </View>
          )}
        </View>

        <View style={{ marginTop: 18 }}>
          {lnurlDomain && (<GaloyInput
            placeholder={translate("common.domain")}
            style={styles.smallText}
            leftIcon={
              <View style={styles.row}>
                <Text style={styles.smallText}>{translate("common.domain")}</Text>
                <Icon
                  name="ios-at"
                  size={24}
                  color={color.primary}
                  style={styles.icon}
                />
              </View>
            }
            onChangeText={setDestination}
            rightIcon={destinationInputRightIcon()}
            value={lnurlDomain}
            editable={interactive}
            selectTextOnFocus
            autoCompleteType="username"
            autoCapitalize="none"
          />)}          
          <GaloyInput
            placeholder={translate("SendBitcoinScreen.input")}
            leftIcon={
              <View style={styles.row}>
                <Text style={styles.smallText}>{translate("common.to")}</Text>
                <Icon
                  name="ios-log-out"
                  size={24}
                  color={color.primary}
                  style={styles.icon}
                />
              </View>
            }
            onChangeText={setDestination}
            rightIcon={destinationInputRightIcon()}
            value={
              paymentType === "lightning"
                ? invoice
                : paymentType === "onchain"
                ? address
                : destination
            }
            editable={interactive}
            selectTextOnFocus
            autoCompleteType="username"
            autoCapitalize="none"
          />
          <GaloyInput
            placeholder={translate("SendBitcoinScreen.note")}
            leftIcon={
              <View style={styles.row}>
                <Text style={styles.smallText}>{translate("common.note")}</Text>
                <Icon
                  name="ios-create-outline"
                  size={24}
                  color={color.primary}
                  style={styles.icon}
                />
              </View>
            }
            value={memo}
            onChangeText={(value) => setMemo(value)}
            selectTextOnFocus
          />
        </View>
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
        <Button
          buttonStyle={styles.buttonStyle}
          containerStyle={{ flex: 1 }}
          title={
            !primaryAmount.value
              ? translate("common.amountRequired")
              : !destination
              ? translate("common.usernameRequired")
              : translate("common.send")
          }
          onPress={pay}
          disabled={!primaryAmount.value || !!errorMessage || !destination}
        />
      </ScrollView>
    </Screen>
  )
}

const styles = EStyleSheet.create({
  buttonStyle: {
    backgroundColor: color.primary,
    marginBottom: "32rem",
    marginHorizontal: "24rem",
    marginTop: "32rem",
  },

  errorContainer: {
    alignItems: "center",
  },

  errorText: {
    color: color.error,
  },

  icon: {
    color: palette.darkGrey,
    marginRight: 15,
  },

  mainView: {
    flex: 1,
    paddingHorizontal: 20,
  },

  row: { flexDirection: "row" },

  section: {
    marginHorizontal: 16,
  },

  smallText: {
    color: palette.darkGrey,
    fontSize: 18,
    textAlign: "left",
    width: "48rem",
  },

  subCurrencyText: {
    color: palette.midGrey,
    fontSize: "20rem",
    marginRight: "10%",
    marginTop: 0,
    paddingTop: 0,
    textAlign: "center",
    width: "90%",
  },
})
