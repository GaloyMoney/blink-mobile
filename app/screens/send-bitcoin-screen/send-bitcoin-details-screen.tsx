import { gql } from "@apollo/client"
import NoteIcon from "@app/assets/icons/note.svg"
import SwitchIcon from "@app/assets/icons/switch.svg"
import { MoneyAmountInput } from "@app/components/money-amount-input"
import {
  useSendBitcoinDetailsScreenQuery,
  Wallet,
  WalletCurrency,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { usePriceConversion } from "@app/hooks"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { palette } from "@app/theme"
import {
  DisplayCurrency,
  lessThanOrEqualTo,
  MoneyAmount,
  moneyAmountIsCurrencyType,
  toBtcMoneyAmount,
  toUsdMoneyAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"
import { fetchLnurlInvoice, Network as NetworkLibGaloy } from "@galoymoney/client"
import { decodeInvoiceString, PaymentType } from "@galoymoney/client/dist/parsing-v2"
import crashlytics from "@react-native-firebase/crashlytics"
import { NavigationProp, RouteProp, useNavigation } from "@react-navigation/native"
import { Button } from "@rneui/base"
import { Satoshis } from "lnurl-pay/dist/types/types"
import React, { useEffect, useState } from "react"
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import ReactNativeModal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { testProps } from "../../utils/testProps"
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
  walletCurrencyText: {
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
  amountHeader: {
    flexDirection: "row",
  },
  sendMaxButton: {
    fontWeight: "normal",
    fontSize: 12,
    textDecorationLine: "underline",
    marginLeft: 12,
    color: palette.lapisLazuli,
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
  warnText: {
    color: palette.midGrey,
    fontWeight: "bold",
  },
  warnTextUnderlined: {
    textDecorationLine: "underline",
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
          walletCurrency
          balance
        }
        usdWallet @client {
          id
          walletCurrency
          balance
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

type Props = {
  route: RouteProp<RootStackParamList, "sendBitcoinDetails">
}

const SendBitcoinDetailsScreen: React.FC<Props> = ({ route }) => {
  const navigation =
    useNavigation<NavigationProp<RootStackParamList, "sendBitcoinDetails">>()
  const { storybook = false } = route.params

  const { data } = useSendBitcoinDetailsScreenQuery({
    ...(!storybook && { returnPartialData: true }),
    skip: !useIsAuthed(),
  })

  const {
    formatDisplayAndWalletAmount,
    formatMoneyAmount,
    getSecondaryAmountIfCurrencyIsDifferent,
  } = useDisplayCurrency()
  const { LL } = useI18nContext()
  const { convertMoneyAmount: _convertMoneyAmount } = usePriceConversion()

  const defaultWallet = data?.me?.defaultAccount?.defaultWallet
  const btcWallet = data?.me?.defaultAccount?.btcWallet
  const network = data?.globals?.network

  const wallets = data?.me?.defaultAccount?.wallets
  const { paymentDestination } = route.params

  const [paymentDetail, setPaymentDetail] =
    useState<PaymentDetail<WalletCurrency> | null>(null)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [asyncErrorMessage, setAsyncErrorMessage] = useState("")

  const [sendingMax, setSendingMax] = useState(false)
  const [prevAmountBeforeMax, setPrevAmountBeforeMax] =
    useState<MoneyAmount<WalletOrDisplayCurrency> | null>(null)

  useEffect(() => {
    if (!_convertMoneyAmount) {
      return
    }

    setPaymentDetail(
      (paymentDetail) =>
        paymentDetail && paymentDetail.setConvertMoneyAmount(_convertMoneyAmount),
    )
  }, [_convertMoneyAmount, setPaymentDetail])

  useEffect(() => {
    if (paymentDetail || !defaultWallet || !_convertMoneyAmount) {
      return
    }

    // usd wallets do not currently support onchain payments
    const initialWallet =
      paymentDestination.validDestination.paymentType === PaymentType.Onchain && btcWallet
        ? btcWallet
        : defaultWallet

    let initialPaymentDetail = paymentDestination.createPaymentDetail({
      convertMoneyAmount: _convertMoneyAmount,
      sendingWalletDescriptor: {
        id: initialWallet.id,
        currency: initialWallet.walletCurrency,
      },
    })

    // Start with usd as the unit of account
    if (initialPaymentDetail.canSetAmount) {
      initialPaymentDetail = initialPaymentDetail.setAmount({
        amount: 0,
        currency: DisplayCurrency,
      })
    }

    setPaymentDetail(initialPaymentDetail)
  }, [
    setPaymentDetail,
    paymentDestination,
    _convertMoneyAmount,
    paymentDetail,
    defaultWallet,
    btcWallet,
  ])

  if (!paymentDetail) {
    return <></>
  }

  const { sendingWalletDescriptor, settlementAmount, convertMoneyAmount } = paymentDetail
  const lnurlParams =
    paymentDetail?.paymentType === "lnurl" ? paymentDetail?.lnurlParams : undefined

  const btcBalanceMoneyAmount = toBtcMoneyAmount(
    data?.me?.defaultAccount?.btcWallet?.balance,
  )

  const usdBalanceMoneyAmount = toUsdMoneyAmount(
    data?.me?.defaultAccount?.usdWallet?.balance,
  )

  const btcWalletText = formatDisplayAndWalletAmount({
    displayAmount: convertMoneyAmount(btcBalanceMoneyAmount, DisplayCurrency),
    walletAmount: btcBalanceMoneyAmount,
  })

  const usdWalletText = formatDisplayAndWalletAmount({
    displayAmount: convertMoneyAmount(usdBalanceMoneyAmount, DisplayCurrency),
    walletAmount: usdBalanceMoneyAmount,
  })

  let validAmount = true
  let invalidAmountErrorMessage = ""

  if (moneyAmountIsCurrencyType(settlementAmount, WalletCurrency.Btc)) {
    validAmount = lessThanOrEqualTo({
      value: settlementAmount,
      lessThanOrEqualTo: btcBalanceMoneyAmount,
    })
    if (!validAmount) {
      invalidAmountErrorMessage = LL.SendBitcoinScreen.amountExceed({
        balance: btcWalletText,
      })
    }
  }

  if (moneyAmountIsCurrencyType(settlementAmount, WalletCurrency.Usd)) {
    validAmount = lessThanOrEqualTo({
      value: settlementAmount,
      lessThanOrEqualTo: usdBalanceMoneyAmount,
    })
    if (!validAmount) {
      invalidAmountErrorMessage = LL.SendBitcoinScreen.amountExceed({
        balance: usdWalletText,
      })
    }
  }

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
    setSendingMax(false)
  }

  const chooseWallet = (wallet: Pick<Wallet, "id" | "walletCurrency">) => {
    // usd wallets do not currently support onchain payments
    if (
      wallet.walletCurrency === WalletCurrency.Usd &&
      paymentDestination.validDestination.paymentType === PaymentType.Onchain
    ) {
      Alert.alert(LL.SendBitcoinScreen.walletDoesNotSupportOnchain())
      toggleModal()
      return
    }

    let updatedPaymentDetail = paymentDetail.setSendingWalletDescriptor({
      id: wallet.id,
      currency: wallet.walletCurrency,
    })

    // switch back to the display currency
    if (updatedPaymentDetail.canSetAmount) {
      const displayAmount = updatedPaymentDetail.convertMoneyAmount(
        paymentDetail.unitOfAccountAmount,
        DisplayCurrency,
      )
      updatedPaymentDetail = updatedPaymentDetail.setAmount(displayAmount)
    }

    setPaymentDetail(updatedPaymentDetail)
    toggleModal()
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
                chooseWallet(wallet)
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
                          style={Styles.walletCurrencyText}
                        >{`${LL.common.btcAccount()}`}</Text>
                      </>
                    ) : (
                      <>
                        <Text
                          style={Styles.walletCurrencyText}
                        >{`${LL.common.usdAccount()}`}</Text>
                      </>
                    )}
                  </View>
                  <View style={Styles.walletSelectorBalanceContainer}>
                    {wallet.walletCurrency === WalletCurrency.Btc ? (
                      <>
                        <Text style={Styles.walletBalanceText}>{btcWalletText}</Text>
                      </>
                    ) : (
                      <>
                        <Text style={Styles.walletBalanceText}>{usdWalletText}</Text>
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
          const btcAmount = paymentDetail.convertMoneyAmount(
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
            setAsyncErrorMessage(LL.SendBitcoinScreen.lnurlInvoiceIncorrectAmount())
            return
          }

          const decodedDescriptionHash = decodedInvoice.tags.find(
            (tag) => tag.tagName === "purpose_commit_hash",
          )?.data

          if (paymentDetail.lnurlParams.metadataHash !== decodedDescriptionHash) {
            setAsyncErrorMessage(LL.SendBitcoinScreen.lnurlInvoiceIncorrectDescription())
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
          setAsyncErrorMessage(LL.SendBitcoinScreen.failedToFetchLnurlInvoice())
          return
        }
      }

      if (paymentDetailForConfirmation.sendPayment) {
        navigation.navigate("sendBitcoinConfirmation", {
          paymentDetail: paymentDetailForConfirmation,
        })
      }
    })

  const displayAmount = paymentDetail.convertMoneyAmount(
    paymentDetail.unitOfAccountAmount,
    DisplayCurrency,
  )

  // primary amount should be the unit of account amount when the amount can be set, otherwise it should be the display amount
  const primaryAmount = paymentDetail.canSetAmount
    ? paymentDetail.unitOfAccountAmount
    : displayAmount

  const secondaryAmount = getSecondaryAmountIfCurrencyIsDifferent({
    primaryAmount,
    displayAmount,
    walletAmount: paymentDetail.settlementAmount,
  })

  const setAmount = (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>) => {
    setPaymentDetail((paymentDetail) =>
      paymentDetail?.setAmount ? paymentDetail.setAmount(moneyAmount) : paymentDetail,
    )
  }

  const setAmountClearMax = (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>) => {
    setSendingMax(false)
    setAmount(moneyAmount)
  }

  let LnUrlMinMaxAmount: React.ReactNode = null

  if (lnurlParams && convertMoneyAmount) {
    LnUrlMinMaxAmount = (
      <Text {...testProps("lnurl-min-max")}>
        {"Min: "}
        {formatMoneyAmount(
          convertMoneyAmount(toBtcMoneyAmount(lnurlParams.min), primaryAmount.currency),
        )}
        {" - Max: "}
        {formatMoneyAmount(
          convertMoneyAmount(toBtcMoneyAmount(lnurlParams.max), primaryAmount.currency),
        )}
      </Text>
    )
  }

  const errorMessage = asyncErrorMessage || invalidAmountErrorMessage

  const swapCurrency = () => {
    setSendingMax(false)
    secondaryAmount &&
      paymentDetail.canSetAmount &&
      setPaymentDetail(paymentDetail.setAmount(secondaryAmount))
  }

  const setSendMax = () => {
    setPrevAmountBeforeMax(primaryAmount)
    setSendingMax(true)
    if (sendingWalletDescriptor.currency === WalletCurrency.Btc)
      setAmount(btcBalanceMoneyAmount)
    else if (sendingWalletDescriptor.currency === WalletCurrency.Usd)
      setAmount(usdBalanceMoneyAmount)
  }
  const removeSendMax = () => {
    setSendingMax(false)
    if (prevAmountBeforeMax) setAmount(prevAmountBeforeMax)
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
          <TouchableWithoutFeedback onPress={toggleModal} accessible={false}>
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
                      <Text style={Styles.walletCurrencyText}>
                        {LL.common.btcAccount()}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={Styles.walletCurrencyText}>
                        {LL.common.usdAccount()}
                      </Text>
                    </>
                  )}
                </View>
                <View style={Styles.walletSelectorBalanceContainer}>
                  <Text
                    {...testProps(`${sendingWalletDescriptor.currency} Wallet Balance`)}
                    style={Styles.walletBalanceText}
                  >
                    {sendingWalletDescriptor.currency === WalletCurrency.Btc
                      ? btcWalletText
                      : usdWalletText}
                  </Text>
                </View>
                <View />
              </View>

              <View style={Styles.pickWalletIcon}>
                <Icon name={"chevron-down"} size={24} color={palette.lightBlue} />
              </View>
            </View>
          </TouchableWithoutFeedback>
          {chooseWalletModal}
        </View>
        <View style={Styles.fieldContainer}>
          <View style={Styles.amountHeader}>
            <Text style={Styles.fieldTitleText}>{LL.SendBitcoinScreen.amount()}</Text>
            {paymentDetail.canSetAmount &&
              paymentDestination.validDestination.paymentType === "onchain" && (
                <TouchableWithoutFeedback
                  onPress={sendingMax ? removeSendMax : setSendMax}
                >
                  <Text style={Styles.sendMaxButton}>
                    {sendingMax ? "Sending max (undo)" : LL.SendBitcoinScreen.sendMax()}
                  </Text>
                </TouchableWithoutFeedback>
              )}
          </View>
          <View style={Styles.fieldBackground}>
            <View style={Styles.currencyInputContainer}>
              <>
                <MoneyAmountInput
                  moneyAmount={primaryAmount}
                  setAmount={setAmountClearMax}
                  editable={paymentDetail.canSetAmount}
                  style={Styles.walletBalanceInput}
                  {...testProps(`${primaryAmount.currency} Input`)}
                />
                {secondaryAmount && (
                  <MoneyAmountInput
                    moneyAmount={secondaryAmount}
                    editable={false}
                    style={Styles.convertedAmountText}
                    {...testProps(`${secondaryAmount.currency} Input`)}
                  />
                )}
              </>
            </View>
            {secondaryAmount && paymentDetail.canSetAmount && (
              <TouchableWithoutFeedback
                {...testProps("switch-button")}
                onPress={swapCurrency}
              >
                <View style={Styles.switchCurrencyIconContainer}>
                  <SwitchIcon />
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
          {LnUrlMinMaxAmount}
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
                maxLength={500}
              />
            </View>
          </View>
        </View>

        {Boolean(errorMessage) && (
          <View style={Styles.errorContainer}>
            <Text style={Styles.errorText}>{errorMessage}</Text>
          </View>
        )}
        {sendingMax && (
          <View style={Styles.errorContainer}>
            <Text style={Styles.warnText}>
              <Text>{LL.SendBitcoinScreen.sendMaxWarning()} </Text>
              <TouchableWithoutFeedback onPress={removeSendMax}>
                <Text style={Styles.warnTextUnderlined}>
                  {LL.SendBitcoinScreen.sendMaxUndo()}
                </Text>
              </TouchableWithoutFeedback>
            </Text>
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
