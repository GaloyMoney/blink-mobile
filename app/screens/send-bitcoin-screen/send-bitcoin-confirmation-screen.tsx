import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, FlatList, ScrollView, Text, View } from "react-native"
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
import {
  currencyToTextWithUnits,
  textCurrencyFormatting,
} from "../../utils/currencyConversion"
import { useBTCPrice, useCurrencyConversion } from "../../hooks"
import { PaymentLottieView } from "./payment-lottie-view"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { StackNavigationProp } from "@react-navigation/stack"

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

type PaymentInformationElement = {
  label: string
  data: JSX.Element
}

type Status = "idle" | "loading" | "pending" | "success" | "error"

export const SendBitcoinConfirmationScreen = ({
  navigation,
  route,
}: SendBitcoinConfirmationScreenProps): JSX.Element => {
  const client = useApolloClient()
  const btcPrice = useBTCPrice()
  const currencyConversion = useCurrencyConversion()
  const {
    address,
    amountless,
    invoice,
    memo,
    paymentType,
    prefCurrency,
    primaryAmount,
    sameNode,
    username,
  } = useMemo(() => {
    return route.params
  }, [route.params])

  const [errs, setErrs] = useState<{ message: string }[]>([])
  // idle, loading, pending, success, error
  const [status, setStatus] = useState<Status>("idle")
  // if null ==> we don't know (blank fee field)
  // if -1, there is an error
  // otherwise, fee in sats
  const [fee, setFee] = useState(null)

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

  const satAmount = useMemo(() => {
    return currencyConversion[primaryAmount.currency]["BTC"](primaryAmount.value)
  }, [currencyConversion, primaryAmount])

  const secondaryAmount: MoneyAmount = useMemo(() => {
    const otherCurrency = primaryAmount.currency === "BTC" ? "USD" : "BTC"
    return {
      value: currencyConversion[primaryAmount.currency][otherCurrency](
        primaryAmount.value,
      ),
      currency: otherCurrency,
    }
  }, [currencyConversion, primaryAmount])

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
      setStatus("error")
      setErrs([{ message: translate("SendBitcoinScreen.noAmount") }])
      return
    }

    if (paymentType === "username" && !UsernameValidation.isValid(username)) {
      setStatus("error")
      setErrs([{ message: translate("SendBitcoinScreen.invalidUsername") }])
      return
    }

    setErrs([])
    setStatus("loading")
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
        console.log("ABOUT TO PAY", paymentType, variables)
        ;({ data, errors } = await mutation({ variables }))
      } catch (err) {
        console.log({ err, errors }, "mutation error")

        setStatus("error")
        setErrs([err])
        return
      }

      let success
      let pending

      if (paymentType === "lightning") {
        success = data?.invoice?.payInvoice === "success" ?? false
        pending = data?.invoice?.payInvoice === "pending" ?? false
      } else if (paymentType === "onchain") {
        success = data?.onchain?.pay?.success
      } else if (paymentType === "username") {
        success = data?.invoice?.payKeysendUsername === "success" ?? false
      }

      if (success) {
        queryWallet(client, "network-only")
        setStatus("success")
      } else if (pending) {
        setStatus("pending")
      } else {
        setStatus("error")
        setErrs(errors)
      }
    } catch (err) {
      console.log({ err }, "error loop")
      setStatus("error")
      setErrs([{ message: `an error occured. try again later\n${err}` }])
    }
  }

  useEffect(() => {
    if (status === "loading" || status === "idle") {
      return
    }

    let notificationType

    if (status === "pending" || status === "error") {
      notificationType = "notificationError"
    }

    if (status === "success") {
      notificationType = "notificationSuccess"
    }

    const optionsHaptic = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    }

    ReactNativeHapticFeedback.trigger(notificationType, optionsHaptic)
  }, [status])

  const feeTextFormatted = useMemo(() => {
    return textCurrencyFormatting(fee ?? 0, btcPrice, prefCurrency)
  }, [btcPrice, fee, prefCurrency])

  const feeText = useMemo(() => {
    if (fee === null && paymentType !== "username") {
      return ""
    } else if (fee > 0) {
      return `${feeTextFormatted}, ${translate("common.Total")}: ${textCurrencyFormatting(
        fee + satAmount,
        btcPrice,
        prefCurrency,
      )}`
    } else if (fee === -1 || fee === undefined) {
      return fee
    } else {
      return feeTextFormatted
    }
  }, [btcPrice, fee, feeTextFormatted, paymentType, prefCurrency, satAmount])

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

  const amountElement: JSX.Element = useMemo(() => {
    return (
      <>
        <Text style={styles.paymentInformationData}>
          {currencyToTextWithUnits(primaryAmount)}
        </Text>
        <Text style={styles.paymentInformationSubData}>
          {currencyToTextWithUnits(secondaryAmount)}
        </Text>
      </>
    )
  }, [primaryAmount, secondaryAmount])

  const destinationElement: JSX.Element | null = useMemo(() => {
    let destination = ""
    if (paymentType === "username") {
      destination = username
    } else if (paymentType === "lightning") {
      destination = `${invoice.substr(0, 18)}...${invoice.substr(-18)}`
    } else if (paymentType === "onchain") {
      destination = address
    }
    return destination.length > 0 ? (
      <Text style={styles.paymentInformationData}>{destination}</Text>
    ) : null
  }, [address, invoice, paymentType, username])

  const feeElement: JSX.Element = useMemo(() => {
    if (fee === undefined) {
      return (
        <ActivityIndicator
          style={styles.activityIndicator}
          animating
          size="small"
          color={palette.orange}
        />
      )
    } else if (fee === -1) {
      return (
        <Text style={styles.paymentInformationData}>
          {translate("SendBitcoinScreen.feeCalculationUnsuccessful")}
        </Text>
      ) // todo: same calculation as backend
    }
    return <Text style={styles.paymentInformationData}>{feeText}</Text>
  }, [fee, feeText])

  const paymentInformation: PaymentInformationElement[] = useMemo(() => {
    return [
      {
        label: "Amount:",
        data: amountElement,
      },
      {
        label: "To:",
        data: destinationElement,
      },
      {
        label: "Fee:",
        data: feeElement,
      },
    ]
  }, [amountElement, destinationElement, feeElement])

  return (
    <Screen preset="fixed">
      <ScrollView
        style={styles.mainView}
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.paymentInformation}>
          <FlatList
            data={paymentInformation}
            renderItem={({ item }) => (
              <View style={styles.paymentInformationRow}>
                <Text style={styles.paymentInformationLabel}>{item.label}</Text>
                <View style={styles.paymentInformationData}>{item.data}</View>
              </View>
            )}
            scrollEnabled={false}
          />
        </View>
        <View style={styles.paymentLottieContainer}>
          <PaymentLottieView errs={errs} status={status} />
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
              if (status === "success" || status === "pending") {
                navigation.pop(2)
              } else if (errorMessage.length > 0) {
                navigation.pop(1)
              } else {
                pay()
              }
            }}
            title={
              status === "success" || status === "pending"
                ? translate("common.close")
                : status === "error"
                ? translate("common.tryAgain")
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
  activityIndicator: {
    alignItems: "flex-start",
  },

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

  paymentInformation: {
    flex: 1,
    marginTop: "32rem",
  },

  paymentInformationData: {
    flex: 5,
    fontSize: "18rem",
  },

  paymentInformationLabel: {
    flex: 2,
    fontSize: "18rem",
  },

  paymentInformationRow: {
    flexDirection: "row",
    marginBottom: "12rem",
  },

  paymentInformationSubData: {
    color: palette.midGrey,
    fontSize: "14rem",
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
