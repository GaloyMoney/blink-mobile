import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { gql, useApolloClient, useLazyQuery, useMutation } from "@apollo/client"
import { RouteProp } from "@react-navigation/native"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

import { translate } from "../../i18n"
import type { MoveMoneyStackParamList } from "../../navigation/stack-param-lists"
import { getPubKey, QUERY_TRANSACTIONS, queryWallet } from "../../graphql/query"
import { UsernameValidation } from "../../utils/validation"
import { textCurrencyFormatting } from "../../utils/currencyConversion"
import { useBTCPrice, usePrefCurrency } from "../../hooks"
import { PaymentLottieView } from "./payment-lottie-view"
import { color } from "../../theme"
import { palette } from "../../theme/palette"

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

class FeeActivityIndicator extends React.Component {
  render() {
    return <ActivityIndicator animating size="small" color={palette.orange} />
  }
}

class FeeCalculationUnsuccessfulText extends React.Component {
  render() {
    return <Text>{translate("SendBitcoinScreen.feeCalculationUnsuccessful")}</Text> // todo: same calculation as backend
  }
}

type SendBitcoinConfirmationScreenProps = {
  route: RouteProp<MoveMoneyStackParamList, "sendBitcoinConfirmation">
}

export const SendBitcoinConfirmationScreen = ({ route }: SendBitcoinConfirmationScreenProps): JSX.Element => {
  const client = useApolloClient()
  const btcPrice = useBTCPrice()
  const [prefCurrency] = usePrefCurrency()
  const { address, amountless, invoice, memo, paymentType, sameNode, satAmount, usdAmount, username } = useMemo(() => {
    return route.params
  }, [route.params])

  const [errs, setErrs] = useState([])
  // idle, loading, pending, success, error
  const [status, setStatus] = useState("idle")
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
          } = await getOnchainFees({ variables: { address, amount: satAmount } })
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
        variables = { invoice, amount: amountless ? satAmount : undefined, memo }
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
    textCurrencyFormatting(fee ?? 0, btcPrice, prefCurrency)
  }, [btcPrice, fee, prefCurrency])

  const feeText = useMemo(() => {
    if (fee === null) {
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
  }, [btcPrice, fee, feeTextFormatted, prefCurrency, satAmount])

  const totalAmount = useMemo(() => {
    fee == null ? satAmount : satAmount + fee
  }, [fee, satAmount])


  return (
    <>
      <View style={styles.paymentLottieContainer}>
        <PaymentLottieView
          errs={errs}
          status={status}
        />
      </View>
      <Button
        buttonStyle={styles.buttonStyle}
        title={translate("common.tryAgain")}
      />
    </>
  )
}

const styles = EStyleSheet.create({
  buttonStyle: {
    backgroundColor: color.primary,
    marginBottom: 32,
    marginHorizontal: 24,
    marginTop: 32,
  },

  paymentLottieContainer: {
    alignItems: "center"
  }
})
