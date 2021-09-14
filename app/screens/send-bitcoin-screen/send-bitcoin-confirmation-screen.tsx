import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { gql, useApolloClient, useLazyQuery, useMutation } from "@apollo/client"
import { RouteProp } from "@react-navigation/native"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import type { MoveMoneyStackParamList } from "../../navigation/stack-param-lists"
import {
  getPubKey,
  QUERY_TRANSACTIONS,
  queryWallet,
  balanceBtc,
} from "../../graphql/query"
import { UsernameValidation } from "../../utils/validation"
import { textCurrencyFormatting } from "../../utils/currencyConversion"
import { useBTCPrice, useCurrencyConverter } from "../../hooks"
import { PaymentStatusIndicator } from "./payment-status-indicator"
import { color } from "../../theme"
import { StackNavigationProp } from "@react-navigation/stack"
import { PaymentConfirmationInformation } from "./payment-confirmation-information"

export const LIGHTNING_PAY = gql`
  mutation payInvoice($invoice: String!, $amount: Int, $memo: String) {
    invoice {
      payInvoice(invoice: $invoice, amount: $amount, memo: $memo)
    }
  }
`

export const PAY_KEYSEND_USERNAME = gql`
  mutation payKeysendUsername(
    $amount: Int!
    $destination: String!
    $username: String!
    $memo: String
  ) {
    invoice {
      payKeysendUsername(
        amount: $amount
        destination: $destination
        username: $username
        memo: $memo
      )
    }
  }
`

const ONCHAIN_PAY = gql`
  mutation onchain_pay($address: String!, $amount: Int!, $memo: String) {
    onchain {
      pay(address: $address, amount: $amount, memo: $memo) {
        success
      }
    }
  }
`

const LIGHTNING_FEES = gql`
  mutation lightning_fees($invoice: String, $amount: Int) {
    invoice {
      getFee(invoice: $invoice, amount: $amount)
    }
  }
`

const ONCHAIN_FEES = gql`
  mutation onchain_fees($address: String!, $amount: Int) {
    onchain {
      getFee(address: $address, amount: $amount)
    }
  }
`

type SendBitcoinConfirmationScreenProps = {
  navigation: StackNavigationProp<MoveMoneyStackParamList, "sendBitcoinConfirmation">
  route: RouteProp<MoveMoneyStackParamList, "sendBitcoinConfirmation">
}

const Status = {
  IDLE: "idle",
  LOADING: "loading",
  PENDING: "pending",
  SUCCESS: "success",
  ERROR: "error",
} as const

type StatusType = typeof Status[keyof typeof Status]

export const SendBitcoinConfirmationScreen = ({
  navigation,
  route,
}: SendBitcoinConfirmationScreenProps): JSX.Element => {
  const client = useApolloClient()
  const btcPrice = useBTCPrice()
  const currencyConverter = useCurrencyConverter()

  const {
    address,
    amountless,
    invoice,
    memo,
    paymentType,
    prefCurrency,
    referenceAmount,
    sameNode,
    username,
  } = route.params

  const [errs, setErrs] = useState<{ message: string }[]>([])
  // idle, loading, pending, success, error
  const [status, setStatus] = useState<StatusType>(Status.IDLE)
  // if null ==> we don't know (blank fee field)
  // if -1, there is an error
  // otherwise, fee in sats
  const [fee, setFee] = useState<number | null | undefined>(null)

  const [queryTransactions] = useLazyQuery(QUERY_TRANSACTIONS, {
    fetchPolicy: "network-only",
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lightningPay, { loading: paymentlightningLoading }] = useMutation(
    LIGHTNING_PAY,
    {
      update: () => queryTransactions(),
    },
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [payKeysendUsername, { loading: paymentKeysendLoading }] = useMutation(
    PAY_KEYSEND_USERNAME,
    { update: () => queryTransactions() },
  )

  // TODO: add user automatically to cache
  // {
  //   update(cache, { data }) {
  //     cache.modify({
  //       fields: {
  //         Contact
  //       }
  //     })
  // }}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [onchainPay, { loading: paymentOnchainLoading }] = useMutation(ONCHAIN_PAY, {
    update: () => queryTransactions(),
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [getLightningFees, { loading: lightningFeeLoading }] = useMutation(LIGHTNING_FEES)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [getOnchainFees, { loading: onchainFeeLoading }] = useMutation(ONCHAIN_FEES)

  const secondaryCurrency: CurrencyType = useMemo(() => {
    return prefCurrency === "BTC" ? "USD" : "BTC"
  }, [prefCurrency])

  const satAmount = useMemo(() => {
    return currencyConverter[referenceAmount.currency]["BTC"](referenceAmount.value)
  }, [currencyConverter, referenceAmount])

  const initializeFees = async () => {
    switch (paymentType) {
      case "lightning":
        if (sameNode) {
          setFee(0)
          return
        }

        if (amountless && satAmount === 0) {
          setFee(null)
          return
        }

        try {
          setFee(undefined)
          const {
            data: {
              invoice: { getFee: fee },
            },
          } = await getLightningFees({
            variables: { invoice, amount: amountless ? satAmount : undefined },
          })
          setFee(fee)
        } catch (err) {
          console.warn({ err, message: "error getting lightning fees" })
          setFee(-1)
        }

        return
      case "onchain":
        if (satAmount === 0) {
          setFee(null)
          return
        }

        try {
          setFee(undefined)
          const {
            data: {
              onchain: { getFee: fee },
            },
          } = await getOnchainFees({
            variables: { address, amount: satAmount },
          })
          setFee(fee)
        } catch (err) {
          console.warn({ err, message: "error getting onchains fees" })
          setFee(-1)
        }
        return
      default:
        setFee(null)
    }
  }

  useEffect(() => {
    initializeFees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pay = async () => {
    if ((amountless || paymentType === "onchain") && satAmount === 0) {
      setStatus(Status.ERROR)
      setErrs([{ message: translate("SendBitcoinScreen.noAmount") }])
      return
    }

    if (paymentType === "username" && !UsernameValidation.isValid(username)) {
      setStatus(Status.ERROR)
      setErrs([{ message: translate("SendBitcoinScreen.invalidUsername") }])
      return
    }

    setErrs([])
    setStatus(Status.LOADING)
    try {
      let mutation
      let variables
      let errors
      let data

      if (paymentType === "lightning") {
        mutation = lightningPay
        variables = {
          invoice,
          amount: amountless ? satAmount : undefined,
          memo,
        }
      } else if (paymentType === "onchain") {
        mutation = onchainPay
        variables = { address, amount: satAmount, memo }
      } else if (paymentType === "username") {
        mutation = payKeysendUsername

        // FIXME destination is confusing
        variables = {
          amount: satAmount,
          destination: getPubKey(client),
          username,
          memo,
        }
      }

      try {
        ;({ data, errors } = await mutation({ variables }))
      } catch (err) {
        console.log({ err, errors }, "mutation error")

        setStatus(Status.ERROR)
        setErrs([err])
        return
      }

      let success
      let pending

      if (paymentType === "lightning") {
        success = data?.invoice?.payInvoice === Status.SUCCESS ?? false
        pending = data?.invoice?.payInvoice === "pending" ?? false
      } else if (paymentType === "onchain") {
        success = data?.onchain?.pay?.success
      } else if (paymentType === "username") {
        success = data?.invoice?.payKeysendUsername === Status.SUCCESS ?? false
      }

      if (success) {
        queryWallet(client, "network-only")
        setStatus(Status.SUCCESS)
      } else if (pending) {
        setStatus(Status.PENDING)
      } else {
        setStatus(Status.ERROR)
        setErrs(errors)
      }
    } catch (err) {
      console.log({ err }, "error loop")
      setStatus(Status.ERROR)
      setErrs([{ message: `an error occured. try again later\n${err}` }])
    }
  }

  useEffect(() => {
    if (status === "loading" || status === "idle") {
      return
    }

    let notificationType

    if (status === Status.PENDING || status === Status.ERROR) {
      notificationType = "notificationError"
    }

    if (status === Status.SUCCESS) {
      notificationType = "notificationSuccess"
    }

    const optionsHaptic = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    }

    ReactNativeHapticFeedback.trigger(notificationType, optionsHaptic)
  }, [status])

  const feeText = useMemo(() => {
    if (fee === undefined || (fee === null && paymentType !== "username")) {
      return ""
    }

    if (fee === -1) {
      return fee.toString()
    }

    return textCurrencyFormatting(fee ?? 0, btcPrice, prefCurrency)
  }, [btcPrice, fee, paymentType, prefCurrency])

  const totalAmount = useMemo(() => {
    return fee == null ? satAmount : satAmount + fee
  }, [fee, satAmount])

  const balance = balanceBtc(client)

  const errorMessage = useMemo(() => {
    if (totalAmount > balance) {
      return translate("SendBitcoinConfirmationScreen.totalExceed", {
        balance: textCurrencyFormatting(balance, btcPrice, prefCurrency),
      })
    }
    return ""
  }, [balance, btcPrice, prefCurrency, totalAmount])

  let destination = ""
  if (paymentType === "username") {
    destination = username
  } else if (paymentType === "lightning") {
    destination = `${invoice.substr(0, 18)}...${invoice.substr(-18)}`
  } else if (paymentType === "onchain") {
    destination = address
  }

  const primaryAmount: MoneyAmount = {
    value: currencyConverter[referenceAmount.currency][prefCurrency](
      referenceAmount.value,
    ),
    currency: prefCurrency,
  }

  const secondaryAmount: MoneyAmount = {
    value: currencyConverter[referenceAmount.currency][secondaryCurrency](
      referenceAmount.value,
    ),
    currency: secondaryCurrency,
  }

  const primaryTotalAmount: MoneyAmount = {
    value: currencyConverter["BTC"][prefCurrency](totalAmount),
    currency: prefCurrency,
  }

  const secondaryTotalAmount: MoneyAmount = {
    value: currencyConverter["BTC"][secondaryCurrency](totalAmount),
    currency: secondaryCurrency,
  }

  return (
    <Screen preset="fixed">
      <ScrollView
        style={styles.mainView}
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="always"
      >
        <PaymentConfirmationInformation
          fee={fee}
          feeText={feeText}
          destination={destination}
          primaryAmount={primaryAmount}
          secondaryAmount={secondaryAmount}
          primaryTotalAmount={primaryTotalAmount}
          secondaryTotalAmount={secondaryTotalAmount}
        />
        <View style={styles.paymentLottieContainer}>
          <PaymentStatusIndicator errs={errs} status={status} />
        </View>
        {errorMessage.length > 0 && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
        <View style={styles.bottomContainer}>
          {status === "idle" && (
            <View style={styles.confirmationTextContainer}>
              <Text style={styles.confirmationText}>
                {translate("SendBitcoinConfirmationScreen.confirmPayment?")}
              </Text>
              <Text style={styles.confirmationText}>
                {translate("SendBitcoinConfirmationScreen.paymentFinal")}
              </Text>
            </View>
          )}
          <Button
            buttonStyle={styles.buttonStyle}
            loading={status === "loading"}
            onPress={() => {
              if (
                status === Status.SUCCESS ||
                status === Status.PENDING ||
                status === Status.ERROR
              ) {
                navigation.pop(2)
              } else if (errorMessage.length > 0) {
                navigation.pop(1)
              } else {
                pay()
              }
            }}
            title={
              status === Status.SUCCESS ||
              status === Status.PENDING ||
              status === Status.ERROR
                ? translate("common.close")
                : errorMessage.length > 0
                ? translate("common.cancel")
                : translate("SendBitcoinConfirmationScreen.confirmPayment")
            }
          />
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = EStyleSheet.create({
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },

  buttonStyle: {
    backgroundColor: color.primary,
    marginBottom: "32rem",
    marginHorizontal: "12rem",
    marginTop: "32rem",
  },

  confirmationText: {
    fontSize: "14rem",
  },

  confirmationTextContainer: {
    alignItems: "center",
  },

  errorContainer: {
    alignItems: "center",
    flex: 1,
  },

  errorText: {
    color: color.error,
  },

  mainView: {
    flex: 1,
    paddingHorizontal: "24rem",
  },

  paymentLottieContainer: {
    alignItems: "center",
    flex: 1,
  },

  scrollView: {
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "space-between",
  },
})
