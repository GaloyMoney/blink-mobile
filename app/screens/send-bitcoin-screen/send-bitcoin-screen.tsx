/* eslint-disable react-native/no-inline-styles */
import { useApolloClient, useLazyQuery } from "@apollo/client"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { TagData } from "bolt11"
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
import { useCurrencyConversion, usePrefCurrency, useBTCPrice } from "../../hooks"
import { translate } from "../../i18n"
import type { MoveMoneyStackParamList } from "../../navigation/stack-param-lists"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import type { ScreenType } from "../../types/jsx"
import { textCurrencyFormatting } from "../../utils/currencyConversion"
import { IPaymentType, validPayment } from "../../utils/parsing"
import { Token } from "../../utils/token"
import { UsernameValidation } from "../../utils/validation"

type SetAmountsInput = {
  value: number
  referenceCurrency?: CurrencyType
}

type SendBitcoinScreenProps = {
  route: RouteProp<MoveMoneyStackParamList, "sendBitcoin">
}

export const SendBitcoinScreen: ScreenType = ({ route }: SendBitcoinScreenProps) => {
  const client = useApolloClient()
  const { navigate } = useNavigation()
  const btcPrice = useBTCPrice()
  const currencyConverter = useCurrencyConversion()
  const [prefCurrency, nextPrefCurrency] = usePrefCurrency()

  const [invoiceError, setInvoiceError] = useState("")

  const [address, setAddress] = useState("")
  const [paymentType, setPaymentType] = useState<IPaymentType>(undefined)
  const [amountless, setAmountless] = useState(false)

  const [satAmount, setSatAmount] = useState(0)
  const [usdAmount, setUsdAmount] = useState(0)

  const referenceCurrency = useCallback((): CurrencyType => {
    if (paymentType === ("lightning" || "onchain") && !amountless) {
      return "BTC"
    }
    return prefCurrency
  }, [amountless, paymentType, prefCurrency])

  const setAmounts = useCallback(
    ({ value, referenceCurrency }: SetAmountsInput) => {
      const postiveValue = value >= 0 ? value : -value
      const mReferenceCurrency = referenceCurrency ?? prefCurrency

      setSatAmount(currencyConverter[mReferenceCurrency]["BTC"](postiveValue))
      setUsdAmount(currencyConverter[mReferenceCurrency]["USD"](postiveValue))
    },
    [currencyConverter, prefCurrency],
  )

  const setAmountsAction = useCallback(
    (input) => {
      setAmounts({ value: input })
    },
    [setAmounts],
  )

  const satMoneyAmount = useCallback((): MoneyAmount => {
    return {
      value: satAmount,
      currency: "BTC",
    }
  }, [satAmount])

  const usdMoneyAmount = useCallback((): MoneyAmount => {
    return {
      value: usdAmount,
      currency: "USD",
    }
  }, [usdAmount])

  const primaryAmount = useMemo((): MoneyAmount => {
    if (prefCurrency === "USD") {
      return usdMoneyAmount()
    }
    return satMoneyAmount()
  }, [prefCurrency, satMoneyAmount, usdMoneyAmount])

  const secondaryAmount = useMemo((): MoneyAmount => {
    if (prefCurrency === "BTC") {
      return usdMoneyAmount()
    }
    return satMoneyAmount()
  }, [prefCurrency, satMoneyAmount, usdMoneyAmount])

  const [destination, setDestinationInternal] = useState("")
  const [invoice, setInvoice] = useState("")
  const [memo, setMemo] = useState<string | number | TagData>("")
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
    setSatAmount(0)
    setUsdAmount(0)
    setDestination("")
    setInvoice("")
    setMemo("")
    setInteractive(true)
  }, [])

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
  }, [client, network, reset, route.params])

  useEffect(() => {
    setAmounts({ value: primaryAmount.value, referenceCurrency: referenceCurrency() })
  }, [btcPrice, primaryAmount, referenceCurrency, setAmounts])

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
          setAmounts({ value: amountInvoice, referenceCurrency: "BTC" })
        }

        if (!memo) {
          setMemo(memoInvoice)
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
  }, [destination, satAmount])

  const errorMessage = useMemo(() => {
    if (invoiceError) {
      return invoiceError
    } else if (!!satAmount && balance && satAmount > balance) {
      return translate("SendBitcoinScreen.totalExceed", {
        balance: textCurrencyFormatting(balance, btcPrice, prefCurrency),
      })
    }
    return null
  }, [balance, btcPrice, invoiceError, prefCurrency, satAmount])

  const pay = useCallback(() => {
    navigate("sendBitcoinConfirmation", {
      address,
      amountless,
      invoice,
      memo,
      paymentType,
      sameNode,
      satAmount, 
      usdAmount,
      username: paymentType === "username" ? destination : null
    })
  }, [address, amountless, destination, invoice, memo, navigate, paymentType, sameNode, satAmount, usdAmount])

  return (
    <SendBitcoinScreenJSX
      paymentType={paymentType}
      amountless={amountless}
      setAmounts={setAmountsAction}
      invoice={invoice}
      address={address}
      memo={memo}
      pay={pay}
      primaryAmount={primaryAmount}
      secondaryAmount={secondaryAmount}
      navigate={navigate}
      nextPrefCurrency={nextPrefCurrency}
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
  status: string
  paymentType: string
  amountless: boolean
  setAmounts: (input: number) => void
  invoice: string
  address: string
  memo: string
  amount: number
  navigate: <RouteName extends string>(
    ...args: [RouteName] | [RouteName, unknown]
  ) => void
  nextPrefCurrency: () => void
  pay: () => void
  primaryAmount: MoneyAmount
  secondaryAmount: MoneyAmount
  setMemo: (memo: string | number | TagData) => void
  setDestination: (destination: string) => void
  destination: string
  usernameExists: boolean
  loadingUserNameExist: boolean
  interactive: boolean
  errorMessage: string
  reset: () => void
}

export const SendBitcoinScreenJSX: ScreenType = ({
  status,
  paymentType,
  amountless,
  setAmounts,
  invoice,
  address,
  memo,
  navigate,
  nextPrefCurrency,
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
      return <Icon name="camera" onPress={() => navigate("scanningQRCode")} size={30} />
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
            editable={
              paymentType === "lightning" || paymentType === "onchain"
                ? amountless && (status === "idle" || status === "error")
                : status !== "success" // bitcoin // TODO: handle amount properly
            }
            forceKeyboard
            nextPrefCurrency={nextPrefCurrency}
            onUpdateAmount={setAmounts}
            primaryAmount={primaryAmount}
            secondaryAmount={secondaryAmount}
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
            renderErrorMessage={false}
            editable={interactive && status !== "success"}
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
            renderErrorMessage={false}
            editable={status !== "success"}
            selectTextOnFocus
          />
        </View>
        <Button
          buttonStyle={styles.buttonStyle}
          containerStyle={{ flex: 1 }}
          title={
            status === "success" || status === "pending"
              ? translate("common.close")
              : !primaryAmount.value
              ? translate("common.amountRequired")
              : !destination
              ? translate("common.usernameRequired")
              : translate("common.send")
          }
          onPress={() =>
            pay()
            // status === "success" || status === "pending" ? goBack() : pay()
          }
          disabled={!primaryAmount.value || !!errorMessage || !destination}
          loading={status === "loading"}
        />
      </ScrollView>
    </Screen>
  )
}

const styles = EStyleSheet.create({
  buttonStyle: {
    backgroundColor: color.primary,
    marginBottom: 32,
    marginHorizontal: 24,
    marginTop: 32,
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
})
