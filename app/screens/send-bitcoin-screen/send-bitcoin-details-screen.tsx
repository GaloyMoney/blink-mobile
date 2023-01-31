import { gql } from "@apollo/client"
import NoteIcon from "@app/assets/icons/note.svg"
import SwitchIcon from "@app/assets/icons/switch.svg"
import { WalletCurrency, useSendBitcoinDetailsScreenQuery } from "@app/graphql/generated"
import { usePriceConversion } from "@app/hooks"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { palette } from "@app/theme"
import {
  paymentAmountToDollarsOrSats,
  satAmountDisplay,
} from "@app/utils/currencyConversion"
import { Network as NetworkLibGaloy, fetchLnurlInvoice } from "@galoymoney/client"
import { decodeInvoiceString } from "@galoymoney/client/dist/parsing-v2"
import crashlytics from "@react-native-firebase/crashlytics"
import { StackScreenProps } from "@react-navigation/stack"
import { Button } from "@rneui/base"
import { Satoshis } from "lnurl-pay/dist/types/types"
import React, { useEffect, useState } from "react"
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { FakeCurrencyInput } from "react-native-currency-input"
import ReactNativeModal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { testProps } from "../../../utils/testProps"
import { createPaymentDetails } from "./payment-details"
import { PaymentDetail } from "./payment-details/index.types"

const Styles = StyleSheet.create({
  scrollView: {
    flexDirection: "column",
    padding: 20,
    flex: 6,
  },
  contentContainer: {
    flexGrow: 1,
  },
  sendBitcoinAmountContainer: {
    flex: 1,
  },
  fieldBackground: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: palette.white,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderRadius: 10,
    alignItems: "center",
    height: 60,
  },
  walletSelectorTypeContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    width: 50,
    marginRight: 20,
  },
  walletSelectorTypeLabelBitcoin: {
    height: 30,
    width: 50,
    borderRadius: 10,
    backgroundColor: "rgba(241, 164, 60, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  walletSelectorTypeLabelUsd: {
    height: 30,
    width: 50,
    backgroundColor: palette.usdSecondary,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  walletSelectorTypeLabelUsdText: {
    fontWeight: "bold",
    color: palette.usdPrimary,
  },
  walletSelectorTypeLabelBtcText: {
    fontWeight: "bold",
    color: palette.btcPrimary,
  },
  walletSelectorInfoContainer: {
    flex: 1,
    flexDirection: "column",
  },
  walletTitleContainer: {
    flex: 1,
  },
  walletBalanceContainer: {
    flex: 1,
  },
  walletTypeText: {
    fontWeight: "bold",
    fontSize: 18,
    color: palette.lapisLazuli,
  },
  walletSelectorTypeTextContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  walletSelectorBalanceContainer: {
    flex: 1,
    flexDirection: "row",
  },
  walletBalanceText: {
    color: palette.midGrey,
  },
  fieldTitleText: {
    fontWeight: "bold",
    color: palette.lapisLazuli,
    marginBottom: 4,
  },
  fieldContainer: {},
  currencyInputContainer: {
    flexDirection: "column",
    flex: 1,
  },
  switchCurrencyIconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
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
  errorContainer: {
    marginVertical: 20,
    flex: 1,
  },
  errorText: {
    color: palette.red,
    textAlign: "center",
  },
  noteContainer: {
    flex: 1,
    flexDirection: "row",
  },
  noteIconContainer: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  noteIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  noteInput: {
    flex: 1,
  },
  button: {
    marginTop: 20,
    height: 60,
    borderRadius: 10,
  },
  disabledButtonStyle: {
    backgroundColor: "rgba(83, 111, 242, 0.1)",
  },
  disabledButtonTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "600",
  },
  activeButtonStyle: {
    backgroundColor: palette.lightBlue,
  },
  activeButtonTitleStyle: {
    color: palette.white,
    fontWeight: "bold",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 50,
  },
  modal: {
    marginBottom: "90%",
  },
  pickWalletIcon: {
    marginRight: 12,
  },
})

gql`
  query sendBitcoinDetailsScreen {
    globals {
      network
    }
    me {
      id
      defaultAccount {
        id
        defaultWallet @client {
          id
          walletCurrency
        }
        btcWallet @client {
          id
          balance
          walletCurrency
          usdBalance
        }
        usdWallet @client {
          id
          balance
          walletCurrency
        }
        wallets {
          id
          walletCurrency
          balance
        }
      }
    }
  }
`

const SendBitcoinDetailsScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "sendBitcoinDetails">) => {
  const { data } = useSendBitcoinDetailsScreenQuery({
    fetchPolicy: "cache-first",
    returnPartialData: true,
  })

  const defaultWallet = data?.me?.defaultAccount?.defaultWallet
  const usdWalletId = data?.me?.defaultAccount?.usdWallet?.id
  const btcWallet = data?.me?.defaultAccount?.btcWallet
  const btcWalletBalance = data?.me?.defaultAccount?.btcWallet?.balance
  const usdWalletBalance = data?.me?.defaultAccount?.usdWallet?.balance
  const network = data?.globals?.network
  const btcBalanceInUsd = data?.me?.defaultAccount?.btcWallet?.usdBalance
  const wallets = data?.me?.defaultAccount?.wallets
  const { validPaymentDestination } = route.params
  const paymentType = validPaymentDestination.paymentType

  const [paymentDetail, setPaymentDetail] =
    useState<PaymentDetail<WalletCurrency> | null>(null)

  const { LL } = useI18nContext()
  const { formatToDisplayCurrency } = useDisplayCurrency()
  const { convertPaymentAmount } = usePriceConversion()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [validAmount, setValidAmount] = useState(false)
  const usdDisabled = paymentType === "onchain" || usdWalletId === undefined

  useEffect(() => {
    setPaymentDetail(
      (paymentDetail) =>
        paymentDetail && paymentDetail.setConvertPaymentAmount(convertPaymentAmount),
    )
  }, [convertPaymentAmount, setPaymentDetail])

  useEffect(() => {
    if (paymentDetail) {
      return
    }
    const initialWallet = usdDisabled ? btcWallet : defaultWallet

    if (!initialWallet) {
      return
    }

    setPaymentDetail(
      createPaymentDetails({
        validPaymentDestination,
        convertPaymentAmount,
        sendingWalletDescriptor: {
          id: initialWallet.id,
          currency: initialWallet.walletCurrency,
        },
        unitOfAccount: WalletCurrency.Usd,
      }),
    )
  }, [
    setPaymentDetail,
    validPaymentDestination,
    convertPaymentAmount,
    paymentDetail,
    defaultWallet,
    usdDisabled,
    btcWallet,
  ])

  const sendingWalletDescriptor = paymentDetail?.sendingWalletDescriptor
  const settlementAmount = paymentDetail?.settlementAmount
  const lnurlParams =
    paymentDetail?.paymentType === "lnurl" ? paymentDetail?.lnurlParams : undefined

  useEffect(() => {
    if (!sendingWalletDescriptor || !settlementAmount) return

    if (sendingWalletDescriptor.currency === WalletCurrency.Btc) {
      if (btcWalletBalance === undefined) return

      const isAmountValid = settlementAmount.amount <= btcWalletBalance
      setValidAmount(isAmountValid)
      if (isAmountValid) {
        setErrorMessage("")
      } else {
        setErrorMessage(
          LL.SendBitcoinScreen.amountExceed({
            balance: satAmountDisplay(btcWalletBalance),
          }),
        )
      }
    }

    if (sendingWalletDescriptor.currency === WalletCurrency.Usd) {
      if (usdWalletBalance === undefined) return

      const isAmountValid = settlementAmount.amount <= usdWalletBalance
      setValidAmount(isAmountValid)
      if (isAmountValid) {
        setErrorMessage("")
      } else {
        setErrorMessage(
          LL.SendBitcoinScreen.amountExceed({
            balance: formatToDisplayCurrency(usdWalletBalance / 100),
          }),
        )
      }
    }
  }, [
    sendingWalletDescriptor,
    settlementAmount,
    btcWalletBalance,
    usdWalletBalance,
    setValidAmount,
    setErrorMessage,
    LL,
    formatToDisplayCurrency,
  ])

  if (!defaultWallet || !sendingWalletDescriptor) {
    return <></>
  }

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
  }

  const chooseWalletModal = wallets && (
    <ReactNativeModal
      style={Styles.modal}
      animationIn="fadeInDown"
      animationOut="fadeOutUp"
      isVisible={isModalVisible}
      onBackButtonPress={toggleModal}
    >
      <View>
        {wallets.map((wallet) => {
          return (
            <TouchableWithoutFeedback
              key={wallet.id}
              onPress={() => {
                setPaymentDetail(
                  (paymentDetail) =>
                    paymentDetail &&
                    paymentDetail.setSendingWalletDescriptor({
                      id: wallet.id,
                      currency: wallet.walletCurrency,
                    }),
                )
                toggleModal()
              }}
            >
              <View style={Styles.fieldBackground}>
                <View style={Styles.walletSelectorTypeContainer}>
                  <View
                    style={
                      wallet.walletCurrency === WalletCurrency.Btc
                        ? Styles.walletSelectorTypeLabelBitcoin
                        : Styles.walletSelectorTypeLabelUsd
                    }
                  >
                    {wallet.walletCurrency === WalletCurrency.Btc ? (
                      <Text style={Styles.walletSelectorTypeLabelBtcText}>BTC</Text>
                    ) : (
                      <Text style={Styles.walletSelectorTypeLabelUsdText}>USD</Text>
                    )}
                  </View>
                </View>
                <View style={Styles.walletSelectorInfoContainer}>
                  <View style={Styles.walletSelectorTypeTextContainer}>
                    {wallet.walletCurrency === WalletCurrency.Btc ? (
                      <>
                        <Text
                          style={Styles.walletTypeText}
                        >{`${LL.common.btcAccount()}`}</Text>
                      </>
                    ) : (
                      <>
                        <Text
                          style={Styles.walletTypeText}
                        >{`${LL.common.usdAccount()}`}</Text>
                      </>
                    )}
                  </View>
                  <View style={Styles.walletSelectorBalanceContainer}>
                    {wallet.walletCurrency === WalletCurrency.Btc ? (
                      <>
                        <Text style={Styles.walletBalanceText}>
                          {typeof btcBalanceInUsd === "number"
                            ? formatToDisplayCurrency(btcBalanceInUsd) + " - "
                            : ""}
                          {typeof btcWalletBalance === "number"
                            ? satAmountDisplay(btcWalletBalance)
                            : ""}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={Styles.walletBalanceText}>
                          {typeof usdWalletBalance === "number"
                            ? formatToDisplayCurrency(usdWalletBalance / 100)
                            : ""}
                        </Text>
                      </>
                    )}
                  </View>
                  <View />
                </View>
              </View>
            </TouchableWithoutFeedback>
          )
        })}
      </View>
    </ReactNativeModal>
  )

  const showWalletPicker = !usdDisabled && wallets?.length && wallets.length > 1

  const goToNextScreen =
    (paymentDetail.sendPayment ||
      (paymentDetail.paymentType === "lnurl" && paymentDetail.unitOfAccountAmount)) &&
    (async () => {
      let paymentDetailForConfirmation: PaymentDetail<WalletCurrency> = paymentDetail

      if (paymentDetail.paymentType === "lnurl") {
        if (!paymentDetail.unitOfAccountAmount) {
          return
        }
        try {
          const btcAmount = paymentDetail.convertPaymentAmount(
            paymentDetail.unitOfAccountAmount,
            "BTC",
          )

          const result = await fetchLnurlInvoice({
            lnUrlOrAddress: paymentDetail.destination,
            tokens: btcAmount.amount as Satoshis,
          })
          const invoice = result.invoice
          const decodedInvoice = decodeInvoiceString(invoice, network as NetworkLibGaloy)

          if (
            Math.round(Number(decodedInvoice.millisatoshis) / 1000) !== btcAmount.amount
          ) {
            setErrorMessage(LL.SendBitcoinScreen.lnurlInvoiceIncorrectAmount())
            return
          }

          const decodedDescriptionHash = decodedInvoice.tags.find(
            (tag) => tag.tagName === "purpose_commit_hash",
          )?.data

          if (paymentDetail.lnurlParams.metadataHash !== decodedDescriptionHash) {
            setErrorMessage(LL.SendBitcoinScreen.lnurlInvoiceIncorrectDescription())
            return
          }

          paymentDetailForConfirmation = paymentDetail.setInvoice({
            paymentRequest: invoice,
            paymentRequestAmount: btcAmount,
          })
        } catch (error) {
          if (error instanceof Error) {
            crashlytics().recordError(error)
          }
          setErrorMessage(LL.SendBitcoinScreen.failedToFetchLnurlInvoice())
          return
        }
      }

      if (paymentDetailForConfirmation.sendPayment) {
        navigation.navigate("sendBitcoinConfirmation", {
          paymentDestination: validPaymentDestination,
          paymentDetail: paymentDetailForConfirmation,
        })
      }
    })

  const usdAmount = paymentDetail.convertPaymentAmount(
    paymentDetail.unitOfAccountAmount,
    "USD",
  )
  const btcAmount = paymentDetail.convertPaymentAmount(
    paymentDetail.unitOfAccountAmount,
    "BTC",
  )
  const setAmountsWithBtc = (sats: number) => {
    setPaymentDetail((paymentDetail) =>
      paymentDetail?.setAmount
        ? paymentDetail.setAmount({
            amount: sats,
            currency: "BTC",
          })
        : paymentDetail,
    )
  }
  const setAmountsWithUsd = (cents: number) => {
    setPaymentDetail((paymentDetail) =>
      paymentDetail?.setAmount
        ? paymentDetail.setAmount({
            amount: cents,
            currency: "USD",
          })
        : paymentDetail,
    )
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={Styles.scrollView}
      contentContainerStyle={Styles.contentContainer}
    >
      <View style={Styles.sendBitcoinAmountContainer}>
        <View style={Styles.fieldContainer}>
          <Text style={Styles.fieldTitleText}>{LL.common.from()}</Text>
          <TouchableWithoutFeedback onPress={() => showWalletPicker && toggleModal()}>
            <View style={Styles.fieldBackground}>
              <View style={Styles.walletSelectorTypeContainer}>
                <View
                  style={
                    sendingWalletDescriptor.currency === WalletCurrency.Btc
                      ? Styles.walletSelectorTypeLabelBitcoin
                      : Styles.walletSelectorTypeLabelUsd
                  }
                >
                  {sendingWalletDescriptor.currency === WalletCurrency.Btc ? (
                    <Text style={Styles.walletSelectorTypeLabelBtcText}>BTC</Text>
                  ) : (
                    <Text style={Styles.walletSelectorTypeLabelUsdText}>USD</Text>
                  )}
                </View>
              </View>
              <View style={Styles.walletSelectorInfoContainer}>
                <View style={Styles.walletSelectorTypeTextContainer}>
                  {sendingWalletDescriptor.currency === WalletCurrency.Btc ? (
                    <>
                      <Text style={Styles.walletTypeText}>Bitcoin Wallet</Text>
                    </>
                  ) : (
                    <>
                      <Text style={Styles.walletTypeText}>US Dollar Wallet</Text>
                    </>
                  )}
                </View>
                <View style={Styles.walletSelectorBalanceContainer}>
                  {sendingWalletDescriptor.currency === WalletCurrency.Btc ? (
                    <>
                      <Text style={Styles.walletBalanceText}>
                        {typeof btcBalanceInUsd === "number"
                          ? formatToDisplayCurrency(btcBalanceInUsd) + " - "
                          : ""}
                        {typeof btcWalletBalance === "number"
                          ? Number(satAmountDisplay(btcWalletBalance))
                          : ""}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={Styles.walletBalanceText}>
                        {typeof usdWalletBalance === "number"
                          ? formatToDisplayCurrency(usdWalletBalance / 100)
                          : ""}
                      </Text>
                    </>
                  )}
                </View>
                <View />
              </View>

              {!usdDisabled && (
                <View style={Styles.pickWalletIcon}>
                  <Icon name={"chevron-down"} size={24} color={palette.lightBlue} />
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
          {chooseWalletModal}
        </View>
        <View style={Styles.fieldContainer}>
          <Text style={Styles.fieldTitleText}>{LL.SendBitcoinScreen.amount()}</Text>
          <View style={Styles.fieldBackground}>
            <View style={Styles.currencyInputContainer}>
              {sendingWalletDescriptor.currency === WalletCurrency.Btc &&
                paymentDetail.unitOfAccountAmount.currency === WalletCurrency.Btc && (
                  <>
                    <FakeCurrencyInput
                      {...testProps("BTC Amount")}
                      value={paymentAmountToDollarsOrSats(
                        paymentDetail.unitOfAccountAmount,
                      )}
                      onChangeValue={setAmountsWithBtc}
                      prefix=""
                      delimiter=","
                      separator="."
                      precision={0}
                      suffix=" sats"
                      minValue={0}
                      editable={paymentDetail.canSetAmount}
                      style={Styles.walletBalanceInput}
                    />
                    <FakeCurrencyInput
                      {...testProps("USD Amount")}
                      value={paymentAmountToDollarsOrSats(usdAmount)}
                      onChangeValue={(amount) => setAmountsWithUsd(Number(amount) * 100)}
                      prefix="$"
                      delimiter=","
                      separator="."
                      precision={2}
                      minValue={0}
                      editable={false}
                      style={Styles.convertedAmountText}
                    />
                  </>
                )}
              {sendingWalletDescriptor.currency === WalletCurrency.Btc &&
                paymentDetail.unitOfAccountAmount.currency === WalletCurrency.Usd && (
                  <>
                    <FakeCurrencyInput
                      {...testProps("USD Amount")}
                      value={paymentAmountToDollarsOrSats(usdAmount)}
                      onChangeValue={(amount) => setAmountsWithUsd(Number(amount) * 100)}
                      prefix="$"
                      delimiter=","
                      separator="."
                      precision={2}
                      style={Styles.walletBalanceInput}
                      minValue={0}
                      editable={paymentDetail.canSetAmount}
                    />
                    <FakeCurrencyInput
                      {...testProps("BTC Amount")}
                      value={paymentAmountToDollarsOrSats(btcAmount)}
                      onChangeValue={setAmountsWithBtc}
                      prefix=""
                      delimiter=","
                      separator="."
                      suffix=" sats"
                      precision={0}
                      minValue={0}
                      editable={false}
                      style={Styles.convertedAmountText}
                    />
                  </>
                )}
              {sendingWalletDescriptor.currency === WalletCurrency.Usd && (
                <FakeCurrencyInput
                  {...testProps("USD Amount")}
                  value={usdAmount ? paymentAmountToDollarsOrSats(usdAmount) : null}
                  onChangeValue={(amount) => setAmountsWithUsd(Number(amount) * 100)}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  minValue={0}
                  style={Styles.walletBalanceInput}
                  editable={paymentDetail.canSetAmount}
                />
              )}
            </View>
            {sendingWalletDescriptor.currency === WalletCurrency.Btc &&
              paymentDetail.canSetAmount && (
                <TouchableWithoutFeedback
                  onPress={() =>
                    setPaymentDetail(
                      paymentDetail.setUnitOfAccount(
                        paymentDetail.unitOfAccountAmount.currency === "BTC"
                          ? "USD"
                          : "BTC",
                      ),
                    )
                  }
                >
                  <View style={Styles.switchCurrencyIconContainer}>
                    <SwitchIcon />
                  </View>
                </TouchableWithoutFeedback>
              )}
          </View>
          {lnurlParams && (
            <Text>
              Min:{" "}
              {sendingWalletDescriptor.currency === WalletCurrency.Usd
                ? convertPaymentAmount(
                    { amount: lnurlParams.min, currency: WalletCurrency.Btc },
                    WalletCurrency.Usd,
                  ).amount / 100
                : lnurlParams.min}{" "}
              - Max:{" "}
              {sendingWalletDescriptor.currency === WalletCurrency.Usd
                ? convertPaymentAmount(
                    { amount: lnurlParams.max, currency: WalletCurrency.Btc },
                    WalletCurrency.Usd,
                  ).amount / 100
                : lnurlParams.max}
            </Text>
          )}
        </View>
        <View style={Styles.fieldContainer}>
          <Text style={Styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>
          <View style={Styles.fieldBackground}>
            <View style={Styles.noteContainer}>
              <View style={Styles.noteIconContainer}>
                <NoteIcon style={Styles.noteIcon} />
              </View>
              <TextInput
                style={Styles.noteInput}
                placeholder={LL.SendBitcoinScreen.note()}
                onChangeText={(text) =>
                  paymentDetail.setMemo && setPaymentDetail(paymentDetail.setMemo(text))
                }
                value={paymentDetail.memo || ""}
                editable={paymentDetail.canSetMemo}
                selectTextOnFocus
                maxLength={lnurlParams ? lnurlParams.commentAllowed : 500}
              />
            </View>
          </View>
        </View>

        {Boolean(errorMessage) && (
          <View style={Styles.errorContainer}>
            <Text style={Styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={Styles.buttonContainer}>
          <Button
            {...testProps(LL.common.next())}
            title={LL.common.next()}
            buttonStyle={[Styles.button, Styles.activeButtonStyle]}
            titleStyle={Styles.activeButtonTitleStyle}
            disabledStyle={[Styles.button, Styles.disabledButtonStyle]}
            disabledTitleStyle={Styles.disabledButtonTitleStyle}
            disabled={!goToNextScreen || !validAmount}
            onPress={goToNextScreen || undefined}
          />
        </View>
      </View>
    </ScrollView>
  )
}

export default SendBitcoinDetailsScreen
