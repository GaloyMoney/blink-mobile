/* eslint-disable react-native/no-inline-styles */
import { useApolloClient, useLazyQuery } from "@apollo/client"
import { RouteProp } from "@react-navigation/native"
import * as React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ActivityIndicator, ScrollView, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { InputPayment } from "../../components/input-payment"
import { GaloyInput } from "../../components/galoy-input"
import { Screen } from "../../components/screen"
import { balanceBtc, USERNAME_EXIST } from "../../graphql/query"
import { useMoneyAmount, useBTCPrice } from "../../hooks"
import { translate } from "../../i18n"
import type { MoveMoneyStackParamList } from "../../navigation/stack-param-lists"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import type { ScreenType } from "../../types/jsx"
import { textCurrencyFormatting } from "../../utils/currencyConversion"
import { IPaymentType, validPayment } from "../../utils/parsing"
import { Token } from "../../utils/token"
import { UsernameValidation } from "../../utils/validation"
import { TextCurrency } from "../../components/text-currency/text-currency"
import { useCurrencies } from "../../hooks/use-currencies"
import { StackNavigationProp } from "@react-navigation/stack"

type SendBitcoinScreenProps = {
  navigation: StackNavigationProp<MoveMoneyStackParamList, "sendBitcoin">
  route: RouteProp<MoveMoneyStackParamList, "sendBitcoin">
}

export const SendBitcoinScreen: ScreenType = ({
  navigation,
  route,
}: SendBitcoinScreenProps) => {
  const client = useApolloClient()
  const btcPrice = useBTCPrice()

  const { primaryCurrency, secondaryCurrency, toggleCurrency } = useCurrencies()

  const [primaryAmount, convertPrimaryAmount, setPrimaryAmount, setPrimaryAmountValue] =
    useMoneyAmount(primaryCurrency)

  const [
    secondaryAmount,
    convertSecondaryAmount,
    setSecondaryAmount,
    setSecondaryAmountValue,
  ] = useMoneyAmount(secondaryCurrency)

  const satAmount =
    primaryCurrency === "BTC" ? primaryAmount.value : secondaryAmount.value

  const [invoiceError, setInvoiceError] = useState("")

  const [address, setAddress] = useState("")
  const [paymentType, setPaymentType] = useState<IPaymentType>(undefined)
  const [amountless, setAmountless] = useState(false)

  const referenceAmount: MoneyAmount = useMemo(() => {
    if ((paymentType === "onchain" || paymentType === "lightning") && !amountless) {
      return {
        value: satAmount,
        currency: "BTC",
      }
    }
    return primaryAmount
  }, [amountless, paymentType, primaryAmount, satAmount])

  const [destination, setDestinationInternal] = useState("")
  const [invoice, setInvoice] = useState("")
  const [memo, setMemo] = useState<string>("")
  const [sameNode, setSameNode] = useState<boolean | null>(null)

  const setDestination = (input) => setDestinationInternal(input.trim())

  const [interactive, setInteractive] = useState(false)

  // TODO use a debouncer to avoid flickering https://github.com/helfer/apollo-link-debounce
  const [
    usernameExistsQuery,
    { loading: loadingUserNameExist, data: dataUsernameExists },
  ] = useLazyQuery(USERNAME_EXIST, { fetchPolicy: "network-only" })

  const usernameExists = dataUsernameExists?.usernameExists ?? false

  const balance = balanceBtc(client)

  const { network } = Token.getInstance()

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
    primaryAmount,
    primaryCurrency,
    secondaryAmount,
    setPrimaryAmount,
    setSecondaryAmount,
  ])

  useEffect(() => {
    reset()
    const { valid, username } = validPayment(route.params?.payment, network, client)
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
  }, [client, network, route.params])

  useEffect(() => {
    // Update the secondary amount based on a new price from the API
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

  useEffect(() => {
    const fn = async () => {
      const {
        valid,
        errorMessage,
        invoice,
        amount: amountInvoice,
        amountless,
        memo: memoInvoice,
        paymentType,
        address,
        sameNode,
      } = validPayment(destination, network, client)

      if (valid) {
        setAddress(address)
        setPaymentType(paymentType)
        setInvoice(invoice)
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

        if (!memo) {
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
          usernameExistsQuery({ variables: { username: destination } })
        }
      }
    }

    fn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination])

  const errorMessage = useMemo(() => {
    if (invoiceError) {
      return invoiceError
    } else if (!!satAmount && balance && satAmount > balance) {
      return translate("SendBitcoinScreen.amountExceed", {
        balance: textCurrencyFormatting(balance, btcPrice, primaryCurrency),
      })
    }
    return null
  }, [balance, btcPrice, invoiceError, primaryCurrency, satAmount])

  const pay = useCallback(() => {
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
    })
  }, [
    address,
    amountless,
    destination,
    invoice,
    memo,
    navigation,
    primaryCurrency,
    referenceAmount,
    paymentType,
    sameNode,
  ])

  return (
    <SendBitcoinScreenJSX
      paymentType={paymentType}
      amountless={amountless}
      setPrimaryAmountValue={setPrimaryAmountValue}
      invoice={invoice}
      address={address}
      memo={memo}
      pay={pay}
      primaryAmount={primaryAmount}
      secondaryAmount={secondaryAmount}
      navigation={navigation}
      toggleCurrency={toggleCurrency}
      setMemo={setMemo}
      setDestination={setDestination}
      destination={destination}
      usernameExists={usernameExists}
      loadingUserNameExist={loadingUserNameExist}
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
  usernameExists: boolean
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
  memo,
  navigation,
  toggleCurrency,
  pay,
  primaryAmount,
  secondaryAmount,
  setMemo,
  setDestination,
  destination,
  usernameExists,
  loadingUserNameExist,
  interactive,
  errorMessage,
  reset,
}: SendBitcoinScreenJSXProps) => {
  const destinationInputRightIcon = () => {
    if (UsernameValidation.hasValidLength(destination) && paymentType === "username") {
      if (loadingUserNameExist) {
        return <ActivityIndicator size="small" />
      } else if (UsernameValidation.isValid(destination) && usernameExists) {
        return <Text>✅</Text>
      } else {
        return <Text>⚠️</Text>
      }
    } else if (paymentType === "lightning" || paymentType === "onchain") {
      return <Icon name="ios-close-circle-outline" onPress={reset} size={30} />
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
            forceKeyboard={navigation?.isFocused ?? false}
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
        </View>

        <View style={{ marginTop: 18 }}>
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
    fontSize: "16rem",
    marginRight: "10%",
    marginTop: 0,
    paddingTop: 0,
    textAlign: "center",
    width: "90%",
  },
})
