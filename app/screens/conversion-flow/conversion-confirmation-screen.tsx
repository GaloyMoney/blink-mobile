import { gql } from "@apollo/client"
import {
  PaymentSendResult,
  WalletCurrency,
  useConversionScreenQuery,
  useIntraLedgerPaymentSendMutation,
  useIntraLedgerUsdPaymentSendMutation,
} from "@app/graphql/generated"
import { joinErrorsMessages } from "@app/graphql/utils"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { palette } from "@app/theme"
import { WalletDescriptor } from "@app/types/wallets"
import { logConversionAttempt, logConversionResult } from "@app/utils/analytics"
import { paymentAmountToTextWithUnits } from "@app/utils/currencyConversion"
import { toastShow } from "@app/utils/toast"
import crashlytics from "@react-native-firebase/crashlytics"
import { CommonActions } from "@react-navigation/native"
import { StackScreenProps } from "@react-navigation/stack"
import { Button } from "@rneui/base"
import { GraphQLError } from "graphql"
import React, { useState } from "react"
import { StyleSheet, Text, View } from "react-native"

gql`
  query conversionScreen {
    me {
      id
      defaultAccount {
        id
        usdWallet @client {
          id
          balance
        }
        btcWallet @client {
          id
          balance
        }
      }
    }
  }
`

export const ConversionConfirmationScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "conversionConfirmation">) => {
  const { fromWalletCurrency, btcAmount, usdAmount, usdPerBtc } = route.params
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [intraLedgerPaymentSend, { loading: intraLedgerPaymentSendLoading }] =
    useIntraLedgerPaymentSendMutation()
  const [intraLedgerUsdPaymentSend, { loading: intraLedgerUsdPaymentSendLoading }] =
    useIntraLedgerUsdPaymentSendMutation()
  const isLoading = intraLedgerPaymentSendLoading || intraLedgerUsdPaymentSendLoading
  const { LL } = useI18nContext()

  let fromWallet: WalletDescriptor<WalletCurrency>
  let toWallet: WalletDescriptor<WalletCurrency>

  const { data } = useConversionScreenQuery({ fetchPolicy: "cache-first" })

  const usdWallet = data?.me?.defaultAccount.usdWallet
  const btcWallet = data?.me?.defaultAccount.btcWallet

  if (!data?.me || !usdWallet || !btcWallet) {
    // TODO: handle errors and or provide some loading state
    return null
  }

  if (fromWalletCurrency === WalletCurrency.Btc) {
    fromWallet = { id: btcWallet.id, currency: WalletCurrency.Btc }
    toWallet = { id: usdWallet.id, currency: WalletCurrency.Usd }
  } else {
    fromWallet = { id: usdWallet.id, currency: WalletCurrency.Usd }
    toWallet = { id: btcWallet.id, currency: WalletCurrency.Btc }
  }

  const fromAmount = fromWallet.currency === WalletCurrency.Btc ? btcAmount : usdAmount
  const toAmount = toWallet.currency === WalletCurrency.Btc ? btcAmount : usdAmount

  const handlePaymentReturn = (
    status: PaymentSendResult,
    errorsMessage: readonly GraphQLError[],
  ) => {
    if (status === "SUCCESS") {
      // navigate to next screen
      navigation.dispatch((state) => {
        const routes = [{ name: "Primary" }, { name: "conversionSuccess" }]
        return CommonActions.reset({
          ...state,
          routes,
          index: routes.length - 1,
        })
      })
    }

    if (errorsMessage?.length) {
      setErrorMessage(joinErrorsMessages(errorsMessage))
    }
  }

  const handlePaymentError = (error: Error) => {
    console.error(error)
    toastShow({ message: error.message })
  }

  const isButtonEnabled = () => {
    return !isLoading
  }

  const payWallet = async () => {
    if (fromWallet.currency === WalletCurrency.Btc) {
      try {
        logConversionAttempt({
          sendingWallet: fromWallet.currency,
          receivingWallet: toWallet.currency,
        })
        const { data, errors } = await intraLedgerPaymentSend({
          variables: {
            input: {
              walletId: fromWallet?.id,
              recipientWalletId: toWallet?.id,
              amount: btcAmount.amount,
            },
          },
          refetchQueries: ["main"],
        })

        const status = data?.intraLedgerPaymentSend.status

        if (!status) {
          throw new Error("Conversion failed")
        }

        logConversionResult({
          sendingWallet: fromWallet.currency,
          receivingWallet: toWallet.currency,
          paymentStatus: status,
        })
        handlePaymentReturn(status, errors || [])
      } catch (err) {
        crashlytics().recordError(err)
        handlePaymentError(err)
      }
    }
    if (fromWallet.currency === WalletCurrency.Usd) {
      try {
        logConversionAttempt({
          sendingWallet: fromWallet.currency,
          receivingWallet: toWallet.currency,
        })
        const { data, errors } = await intraLedgerUsdPaymentSend({
          variables: {
            input: {
              walletId: fromWallet?.id,
              recipientWalletId: toWallet?.id,
              amount: usdAmount.amount,
            },
          },
          refetchQueries: ["main"],
        })

        const status = data?.intraLedgerUsdPaymentSend.status

        if (!status) {
          throw new Error("Conversion failed")
        }

        logConversionResult({
          sendingWallet: fromWallet.currency,
          receivingWallet: toWallet.currency,
          paymentStatus: status,
        })
        handlePaymentReturn(status, errors || [])
      } catch (err) {
        crashlytics().recordError(err)
        handlePaymentError(err)
      }
    }
  }

  return (
    <View style={styles.sendBitcoinConfirmationContainer}>
      <View style={styles.conversionInfoCard}>
        <View style={styles.conversionInfoField}>
          <Text style={styles.conversionInfoFieldTitle}>
            {LL.ConversionConfirmationScreen.youreConverting()}
          </Text>
          <Text style={styles.conversionInfoFieldValue}>
            {paymentAmountToTextWithUnits(fromAmount)}
          </Text>
        </View>
        <View style={styles.conversionInfoField}>
          <Text style={styles.conversionInfoFieldTitle}>{LL.common.to()}</Text>
          <Text style={styles.conversionInfoFieldValue}>
            ~{paymentAmountToTextWithUnits(toAmount)}
          </Text>
        </View>
        <View style={styles.conversionInfoField}>
          <Text style={styles.conversionInfoFieldTitle}>
            {LL.ConversionConfirmationScreen.receivingAccount()}
          </Text>
          <Text style={styles.conversionInfoFieldValue}>
            {toWallet.currency === WalletCurrency.Btc
              ? LL.common.btcAccount()
              : LL.common.usdAccount()}
          </Text>
        </View>
        <View style={styles.conversionInfoField}>
          <Text style={styles.conversionInfoFieldTitle}>{LL.common.rate()}</Text>
          <Text style={styles.conversionInfoFieldValue}>
            ~ {paymentAmountToTextWithUnits(usdPerBtc)} / 1 BTC
          </Text>
        </View>
      </View>
      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <Button
          title={LL.common.convert()}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitleStyle}
          disabledStyle={[styles.button, styles.disabledButtonStyle]}
          disabledTitleStyle={styles.disabledButtonTitleStyle}
          disabled={!isButtonEnabled()}
          onPress={() => payWallet()}
          loading={isLoading}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  sendBitcoinConfirmationContainer: {
    flex: 1,
    flexDirection: "column",
    padding: 10,
  },
  conversionInfoCard: {
    margin: 20,
    backgroundColor: palette.white,
    borderRadius: 10,
    padding: 20,
  },
  conversionInfoField: {
    marginBottom: 20,
  },
  conversionInfoFieldTitle: {},
  conversionInfoFieldValue: {
    fontWeight: "bold",
    color: palette.black,
    fontSize: 18,
  },
  button: {
    height: 60,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 20,
    backgroundColor: palette.lightBlue,
    color: palette.white,
    fontWeight: "bold",
  },
  buttonTitleStyle: {
    color: palette.white,
    fontWeight: "bold",
  },
  disabledButtonStyle: {
    backgroundColor: palette.lighterGrey,
  },
  disabledButtonTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "600",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 10,
  },
  errorContainer: {
    marginBottom: 10,
  },
  errorText: {
    color: palette.red,
    textAlign: "center",
  },
})
