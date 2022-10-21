import { usePriceConversion, useSubscriptionUpdates } from "@app/hooks"
import useMainQuery from "@app/hooks/use-main-query"
import { TYPE_LIGHTNING_BTC } from "@app/utils/wallet"
import { GaloyGQL, useMutation } from "@galoymoney/client"
import React, { useCallback, useEffect, useState } from "react"
import { Pressable, TextInput, View } from "react-native"
import { Button, Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import QRView from "./qr-view"
import { FakeCurrencyInput } from "react-native-currency-input"
import { palette } from "@app/theme"
import SwitchIcon from "@app/assets/icons/switch.svg"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { satAmountDisplay, usdAmountDisplay } from "@app/utils/currencyConversion"

import { useI18nContext } from "@app/i18n/i18n-react"
import { logGeneratePaymentRequest } from "@app/utils/analytics"
import { WalletCurrency } from "@app/types/amounts"
import fetch from "cross-fetch"

const styles = EStyleSheet.create({
  container: {
    marginTop: "14rem",
    marginLeft: 20,
    marginRight: 20,
  },
  field: {
    padding: 10,
    backgroundColor: palette.white,
    borderRadius: 10,
    marginBottom: 12,
  },
  inputForm: {
    marginVertical: 20,
  },
  currencyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: palette.white,
    borderRadius: 10,
  },
  infoText: {
    color: palette.midGrey,
    fontSize: "12rem",
  },
  // copyInvoiceContainer: {
  //   flex: 2,
  //   marginLeft: 10,
  // },
  // shareInvoiceContainer: {
  //   flex: 2,
  //   alignItems: "flex-end",
  //   marginRight: 10,
  // },
  // textContainer: {
  //   flexDirection: "row",
  //   justifyContent: "center",
  //   marginTop: 6,
  // },
  // optionsContainer: {
  //   marginTop: 20,
  // },
  // fieldContainer: {
  //   flexDirection: "row",
  //   alignItems: "center",
  // },
  // fieldIconContainer: {
  //   justifyContent: "center",
  //   marginRight: 10,
  // },
  // fieldTextContainer: {
  //   flex: 4,
  //   justifyContent: "center",
  // },
  // fieldArrowContainer: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "flex-end",
  // },
  // fieldText: {
  //   color: palette.lapisLazuli,
  //   fontSize: "14rem",
  // },
  // textCenter: {
  //   textAlign: "center"
  // },
  textPaddedBottom: {
    paddingBottom: 10,
  },
  walletBalanceInput: {
    color: palette.lapisLazuli,
    fontSize: 20,
    fontWeight: "600",
  },
  convertedAmountText: {
    color: palette.coolGrey,
    fontSize: 12,
  },
  switchCurrencyIconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  currencyInput: {
    flexDirection: "column",
    flex: 1,
  },
  toggle: {
    justifyContent: "flex-end",
  },
  button: {
    height: 60,
    borderRadius: 10,
    marginTop: 40,
  },
  activeButtonStyle: {
    backgroundColor: palette.lightBlue,
  },
  activeButtonTitleStyle: {
    color: palette.white,
    fontWeight: "bold",
  },
  invoiceInfo: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  primaryAmount: {
    fontWeight: "bold",
  },
  convertedAmount: {
    color: palette.coolGrey,
    marginLeft: 5,
  },
  fieldTitleText: {
    fontWeight: "bold",
    color: palette.lapisLazuli,
    marginBottom: 5,
  },
  disabledButtonStyle: {
    backgroundColor: palette.lighterGrey,
  },
  disabledButtonTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "600",
  },
})

const RedeemBtc = ({
  callback,
  domain,
  k1,
  defaultDescription,
  minWithdrawableSatoshis,
  maxWithdrawableSatoshis,
}) => {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")
  const [invoice, setInvoice] = useState<
    GaloyGQL.LnInvoice | GaloyGQL.LnNoAmountInvoice | null
  >(null)
  const [btcAddress, setBtcAddress] = useState<string | null>(null)

  const [satAmount, setSatAmount] = useState(minWithdrawableSatoshis)
  const { convertCurrencyAmount } = usePriceConversion()
  const satAmountInUsd = convertCurrencyAmount({
    amount: satAmount,
    from: "BTC",
    to: "USD",
  })
  const minSatAmountInUsd = convertCurrencyAmount({
    amount: satAmount,
    from: "BTC",
    to: "USD",
  })
  const maxSatAmountInUsd = convertCurrencyAmount({
    amount: satAmount,
    from: "BTC",
    to: "USD",
  })
  const [usdAmount, setUsdAmount] = useState(satAmountInUsd)

  const [memo, setMemo] = useState(defaultDescription)
  const [showMemoInput, setShowMemoInput] = useState(false)
  const [showAmountInput, setShowAmountInput] = useState(true) // TODO: If min==max then don't show amountInput...
  const [amountCurrency, setAmountCurrency] = useState("BTC")

  const [paymentLayer] = useState<"LIGHTNING_BTC">(TYPE_LIGHTNING_BTC)

  const { btcWalletId } = useMainQuery()
  const { lnUpdate } = useSubscriptionUpdates()

  const [lnNoAmountInvoiceCreate] = useMutation.lnNoAmountInvoiceCreate()
  const [lnInvoiceCreate] = useMutation.lnInvoiceCreate()
  const [generateBtcAddress] = useMutation.onChainAddressCurrent()
  const { LL } = useI18nContext()
  const submitWithdrawRequestInvoice = useCallback(
    async ({ walletId, satAmount, memo }) => {
      setLoading(true)
      setInvoice(null)
      try {
        if (satAmount === 0) {
          logGeneratePaymentRequest({
            paymentType: "lightning",
            hasAmount: false,
            receivingWallet: WalletCurrency.BTC,
          })
          const {
            data: {
              lnNoAmountInvoiceCreate: { invoice, errors },
            },
          } = await lnNoAmountInvoiceCreate({
            variables: { input: { walletId, memo } },
          })
          if (errors && errors.length !== 0) {
            console.error(errors, "error with lnNoAmountInvoiceCreate")
            setErr(LL.RedeemBitcoinScreen.error())
            return
          }
          setInvoice(invoice)
          submitLNURLWithdrawRequest(invoice)
        } else {
          logGeneratePaymentRequest({
            paymentType: "lightning",
            hasAmount: true,
            receivingWallet: WalletCurrency.BTC,
          })
          const {
            data: {
              lnInvoiceCreate: { invoice, errors },
            },
          } = await lnInvoiceCreate({
            variables: {
              input: { walletId, amount: satAmount, memo },
            },
          })
          if (errors && errors.length !== 0) {
            console.error(errors, "error with lnInvoiceCreate")
            setErr(LL.RedeemBitcoinScreen.error())
            return
          }
          setInvoice(invoice)
          await submitLNURLWithdrawRequest(invoice)
        }
      } catch (err) {
        console.error(err, "error with AddInvoice")
        setErr(`${err}`)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [lnInvoiceCreate, lnNoAmountInvoiceCreate, LL],
  )

  const updateBtcAddress = useCallback(
    async ({ walletId }) => {
      setLoading(true)
      try {
        logGeneratePaymentRequest({
          paymentType: "onchain",
          hasAmount: false,
          receivingWallet: WalletCurrency.BTC,
        })
        const {
          data: {
            onChainAddressCurrent: { address, errors },
          },
        } = await generateBtcAddress({
          variables: {
            input: { walletId },
          },
        })
        if (errors && errors.length !== 0) {
          console.error(errors, "error with generateBtcAddress")
          setErr(LL.RedeemBitcoinScreen.error())
          return
        }
        setBtcAddress(address)
      } catch (err) {
        console.error(err, "error with updateBtcAddress")
        setErr(`${err}`)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [generateBtcAddress, LL],
  )

  const toggleAmountCurrency = () => {
    if (amountCurrency === "USD") {
      setAmountCurrency("BTC")
    }
    if (amountCurrency === "BTC") {
      setAmountCurrency("USD")
      setUsdAmount(
        convertCurrencyAmount({
          amount: satAmount,
          from: "BTC",
          to: "USD",
        }),
      )
    }
  }

  const submitLNURLWithdrawRequest = async (generatedInvoice) => {
    const url = `${callback}${callback.includes("?") ? "&" : "?"}k1=${k1}&pr=${
      generatedInvoice.paymentRequest
    }`

    const result = await fetch(url)

    if (result.ok) {
      const lnurlResponse = await result.json()
      if (lnurlResponse?.status?.toLowerCase() === "ok") {
        // TODO: Set processing payment
      } else {
        console.error(lnurlResponse, "error with redeeming")
        // TODO: Set failed payment
        setErr(LL.RedeemBitcoinScreen.redeemingError())
      }
    } else {
      console.error(result.text(), "error with submitting withdrawalRequest")
      setErr(LL.RedeemBitcoinScreen.submissionError())
    }
  }

  useEffect((): void | (() => void) => {
    if (btcWalletId && !invoice && !showAmountInput && !showMemoInput) {
      if (paymentLayer === TYPE_LIGHTNING_BTC) {
        submitWithdrawRequestInvoice({ walletId: btcWalletId, satAmount, memo })
      }
    }
  }, [
    btcAddress,
    btcWalletId,
    invoice,
    memo,
    paymentLayer,
    satAmount,
    showAmountInput,
    showMemoInput,
    updateBtcAddress,
    submitWithdrawRequestInvoice,
  ])

  const paymentDestination =
    paymentLayer === TYPE_LIGHTNING_BTC ? invoice?.paymentRequest : btcAddress

  // TODO: Figure out if we need paymentFullUri
  // const paymentFullUri = getFullUri({
  //   type: paymentLayer,
  //   input: paymentDestination,
  //   amount: satAmount,
  //   memo,
  //   prefix: false,
  // })

  const invoicePaid =
    lnUpdate?.paymentHash === invoice?.paymentHash && lnUpdate?.status === "PAID"

  if (showAmountInput) {
    const usdAmountInSats = Math.round(
      convertCurrencyAmount({
        amount: usdAmount ?? 0,
        from: "USD",
        to: "BTC",
      }),
    )

    const validAmount =
      (amountCurrency === "BTC" && satAmount !== null) ||
      (amountCurrency === "USD" && usdAmount !== null)

    return (
      <View style={[styles.inputForm, styles.container]}>
        <View style={styles.currencyInputContainer}>
          <View style={styles.currencyInput}>
            {amountCurrency === "BTC" && (
              <>
                <Text style={styles.infoText}>Amount to redeem from {domain}</Text>
                <FakeCurrencyInput
                  value={satAmount}
                  onChangeValue={(newValue) => setSatAmount(newValue)}
                  prefix=""
                  delimiter=","
                  separator="."
                  precision={0}
                  suffix=" sats"
                  minValue={minWithdrawableSatoshis}
                  maxValue={maxWithdrawableSatoshis}
                  style={styles.walletBalanceInput}
                  autoFocus
                />
                <Text style={styles.infoText}>
                  Min: {minWithdrawableSatoshis} sats, Max: {maxWithdrawableSatoshis} sats
                </Text>
                <FakeCurrencyInput
                  value={satAmountInUsd}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  minValue={minSatAmountInUsd}
                  maxValue={maxSatAmountInUsd}
                  editable={false}
                  style={styles.convertedAmountText}
                />
              </>
            )}
            {amountCurrency === "USD" && (
              <>
                <FakeCurrencyInput
                  value={usdAmount}
                  onChangeValue={(newValue) => setUsdAmount(newValue)}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  style={styles.walletBalanceInput}
                  minValue={minSatAmountInUsd}
                  maxValue={maxSatAmountInUsd}
                  autoFocus
                />
                <Text style={styles.infoText}>
                  Min: {minSatAmountInUsd.toFixed(2)} USD, Max:{" "}
                  {maxSatAmountInUsd.toFixed(2)} USD
                </Text>
                <FakeCurrencyInput
                  value={usdAmountInSats}
                  prefix=""
                  delimiter=","
                  separator="."
                  suffix=" sats"
                  precision={0}
                  minValue={0}
                  editable={false}
                  style={styles.convertedAmountText}
                />
              </>
            )}
          </View>

          <View style={styles.toggle}>
            <Pressable onPress={toggleAmountCurrency}>
              <View style={styles.switchCurrencyIconContainer}>
                <SwitchIcon />
              </View>
            </Pressable>
          </View>
        </View>

        <Button
          title={LL.RedeemBitcoinScreen.redeemBitcoin()}
          buttonStyle={[styles.button, styles.activeButtonStyle]}
          titleStyle={styles.activeButtonTitleStyle}
          disabledStyle={[styles.button, styles.disabledButtonStyle]}
          disabledTitleStyle={styles.disabledButtonTitleStyle}
          disabled={!validAmount}
          onPress={() => {
            if (amountCurrency === "USD" && usdAmount) {
              setSatAmount(usdAmountInSats)
            }
            setShowAmountInput(false)
            setInvoice(null)
          }}
        />
      </View>
    )
  }

  if (showMemoInput) {
    return (
      <View style={styles.inputForm}>
        <View style={styles.container}>
          <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>
          <View style={styles.field}>
            <TextInput
              style={styles.noteInput}
              placeholder={LL.SendBitcoinScreen.note()}
              onChangeText={(note) => setMemo(note)}
              value={memo}
              multiline={true}
              numberOfLines={3}
              autoFocus
            />
          </View>

          <Button
            title={LL.RedeemBitcoinScreen.redeemBitcoin()}
            buttonStyle={[styles.button, styles.activeButtonStyle]}
            titleStyle={styles.activeButtonTitleStyle}
            onPress={() => {
              setShowMemoInput(false)
              setInvoice(null)
            }}
          />
        </View>
      </View>
    )
  }

  const displayAmount = () => {
    if (!satAmount) {
      return (
        <Text style={styles.primaryAmount}>
          {LL.ReceiveBitcoinScreen.flexibleAmountInvoice()}
        </Text>
      )
    }
    return (
      <>
        <Text style={styles.primaryAmount}>{satAmountDisplay(satAmount)}</Text>
        <Text style={styles.convertedAmount}>
          &#8776; {usdAmountDisplay(satAmountInUsd)}
        </Text>
      </>
    )
  }

  const invoiceReady = paymentDestination && !loading
  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        {/* TODO: Read */}
        <Text
          style={[
            styles.center,
            styles.container,
            styles.bigText,
            styles.textCenter,
            styles.textPaddedBottom,
          ]}
        >
          Redeeming Bitcoin from {domain}
        </Text>
        {/* TODO: Replace this with a spinning wheel waiting for payment */}
        <QRView
          data={paymentDestination}
          type={paymentLayer}
          amount={satAmount}
          memo={memo}
          loading={!invoiceReady}
          completed={paymentLayer === TYPE_LIGHTNING_BTC ? invoicePaid : false}
          err={err}
        />
        <View style={styles.invoiceInfo}>{displayAmount()}</View>
      </View>
    </KeyboardAwareScrollView>
  )
}

export default RedeemBtc
