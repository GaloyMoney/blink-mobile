import useMainQuery from "@app/hooks/use-main-query"
import React, { useEffect, useState } from "react"
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { palette } from "@app/theme"
import { WalletCurrency } from "@app/graphql/generated"
import { fetchLnurlInvoice, Network as NetworkLibGaloy } from "@galoymoney/client"
import { Satoshis } from "lnurl-pay/dist/types/types"
import { StackScreenProps } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { usePriceConversion, useUsdBtcAmount } from "@app/hooks"
import {
  paymentAmountToDollarsOrSats,
  satAmountDisplay,
} from "@app/utils/currencyConversion"
import ReactNativeModal from "react-native-modal"
import { FakeCurrencyInput } from "react-native-currency-input"
import SwitchIcon from "@app/assets/icons/switch.svg"
import Icon from "react-native-vector-icons/Ionicons"
import NoteIcon from "@app/assets/icons/note.svg"
import { Button } from "@rneui/base"
import { useI18nContext } from "@app/i18n/i18n-react"
import { testProps } from "../../../utils/testProps"
import crashlytics from "@react-native-firebase/crashlytics"
import { decodeInvoiceString } from "@galoymoney/client/dist/parsing-v2"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"

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

const SendBitcoinDetailsScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "sendBitcoinDetails">) => {
  const {
    fixedAmount,
    destination,
    note: initialNote,
    lnurl: lnurlParams,
    recipientWalletId,
    paymentType,
    sameNode,
  } = route.params

  const {
    defaultWallet,
    usdWalletId,
    btcWalletBalance,
    btcWalletValueInUsd,
    usdWalletBalance,
    network,
  } = useMainQuery()

  const [note, setNote] = useState(initialNote)
  const [fromWallet, setFromWallet] = useState(defaultWallet)
  const { LL } = useI18nContext()
  const { formatToDisplayCurrency } = useDisplayCurrency()
  const { convertPaymentAmount } = usePriceConversion()
  const {
    btcAmount,
    usdAmount,
    setAmountsWithBtc,
    setAmountsWithUsd,
    toggleAmountCurrency,
    paymentAmount,
  } = useUsdBtcAmount(fixedAmount)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const { wallets } = useMainQuery()

  const [errorMessage, setErrorMessage] = useState("")
  const [validAmount, setValidAmount] = useState(false)
  const usdDisabled = paymentType === "onchain" || usdWalletId === undefined
  const isFixedAmountInvoice = fixedAmount !== undefined

  useEffect(() => {
    setFromWallet(
      // Force from wallet to be BTC for onchain
      usdDisabled
        ? wallets.find((wallet) => wallet?.walletCurrency === WalletCurrency.Btc)
        : defaultWallet,
    )
  }, [defaultWallet, usdDisabled, wallets])

  useEffect(() => {
    if (fromWallet.walletCurrency === WalletCurrency.Btc) {
      const isAmountValid = btcAmount.amount <= btcWalletBalance
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

    if (fromWallet.walletCurrency === WalletCurrency.Usd) {
      const isAmountValid = usdAmount.amount <= usdWalletBalance
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
    fromWallet,
    btcAmount,
    usdAmount,
    btcWalletBalance,
    usdWalletBalance,
    setValidAmount,
    setErrorMessage,
    LL,
    formatToDisplayCurrency,
  ])

  if (!defaultWallet) {
    return <></>
  }

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
  }

  const chooseWalletModal = (
    <ReactNativeModal
      style={Styles.modal}
      animationIn="fadeInDown"
      animationOut="fadeOutUp"
      isVisible={isModalVisible}
      onBackButtonPress={() => toggleModal()}
    >
      <View>
        {wallets?.map((wallet) => {
          return (
            <TouchableWithoutFeedback
              key={wallet.id}
              onPress={() => {
                setFromWallet(wallet)
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
                        <Text style={Styles.walletTypeText}>Bitcoin Wallet</Text>
                      </>
                    ) : (
                      <>
                        <Text style={Styles.walletTypeText}>US Dollar Wallet</Text>
                      </>
                    )}
                  </View>
                  <View style={Styles.walletSelectorBalanceContainer}>
                    {wallet.walletCurrency === WalletCurrency.Btc ? (
                      <>
                        <Text style={Styles.walletBalanceText}>
                          {formatToDisplayCurrency(btcWalletValueInUsd)}
                          {" - "}
                          {satAmountDisplay(btcWalletBalance)}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={Styles.walletBalanceText}>
                          {formatToDisplayCurrency(usdWalletBalance / 100)}
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

  const showWalletPicker = !usdDisabled && wallets.length > 1

  const goToNextScreen = async () => {
    let invoice: string | undefined

    if (paymentType === "lnurl") {
      try {
        const result = await fetchLnurlInvoice({
          lnUrlOrAddress: destination,
          tokens: btcAmount.amount as Satoshis,
        })
        invoice = result.invoice
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
        if (lnurlParams.metadataHash !== decodedDescriptionHash) {
          setErrorMessage(LL.SendBitcoinScreen.lnurlInvoiceIncorrectDescription())
          return
        }
      } catch (error) {
        crashlytics().recordError(error)
        setErrorMessage(LL.SendBitcoinScreen.failedToFetchLnurlInvoice())
        return
      }
    }

    const payerWalletDescriptor = {
      id: fromWallet.id,
      currency: fromWallet.walletCurrency as WalletCurrency,
    }
    navigation.navigate("sendBitcoinConfirmation", {
      lnurlInvoice: invoice,
      fixedAmount: paymentType === "lnurl" ? btcAmount : fixedAmount,
      paymentAmountInBtc: btcAmount,
      paymentAmountInUsd: usdAmount,
      recipientWalletId,
      paymentType,
      destination,
      payerWalletDescriptor,
      note,
      sameNode,
    })
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
                    fromWallet.walletCurrency === WalletCurrency.Btc
                      ? Styles.walletSelectorTypeLabelBitcoin
                      : Styles.walletSelectorTypeLabelUsd
                  }
                >
                  {fromWallet.walletCurrency === WalletCurrency.Btc ? (
                    <Text style={Styles.walletSelectorTypeLabelBtcText}>BTC</Text>
                  ) : (
                    <Text style={Styles.walletSelectorTypeLabelUsdText}>USD</Text>
                  )}
                </View>
              </View>
              <View style={Styles.walletSelectorInfoContainer}>
                <View style={Styles.walletSelectorTypeTextContainer}>
                  {fromWallet.walletCurrency === WalletCurrency.Btc ? (
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
                  {fromWallet.walletCurrency === WalletCurrency.Btc ? (
                    <>
                      <Text style={Styles.walletBalanceText}>
                        {formatToDisplayCurrency(btcWalletValueInUsd)}
                        {" - "}
                        {satAmountDisplay(btcWalletBalance)}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={Styles.walletBalanceText}>
                        {formatToDisplayCurrency(usdWalletBalance / 100)}
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
              {fromWallet.walletCurrency === WalletCurrency.Btc &&
                paymentAmount.currency === WalletCurrency.Btc && (
                  <>
                    <FakeCurrencyInput
                      {...testProps("BTC Amount")}
                      value={paymentAmountToDollarsOrSats(btcAmount)}
                      onChangeValue={setAmountsWithBtc}
                      prefix=""
                      delimiter=","
                      separator="."
                      precision={0}
                      suffix=" sats"
                      minValue={0}
                      editable={!isFixedAmountInvoice}
                      style={Styles.walletBalanceInput}
                    />
                    <FakeCurrencyInput
                      {...testProps("USD Amount")}
                      value={paymentAmountToDollarsOrSats(usdAmount)}
                      onChangeValue={(amount) => setAmountsWithUsd(amount * 100)}
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
              {fromWallet.walletCurrency === WalletCurrency.Btc &&
                paymentAmount.currency === WalletCurrency.Usd && (
                  <>
                    <FakeCurrencyInput
                      {...testProps("USD Amount")}
                      value={paymentAmountToDollarsOrSats(usdAmount)}
                      onChangeValue={(amount) => setAmountsWithUsd(amount * 100)}
                      prefix="$"
                      delimiter=","
                      separator="."
                      precision={2}
                      style={Styles.walletBalanceInput}
                      minValue={0}
                      editable={!isFixedAmountInvoice}
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
              {fromWallet.walletCurrency === WalletCurrency.Usd && (
                <FakeCurrencyInput
                  value={paymentAmountToDollarsOrSats(usdAmount)}
                  onChangeValue={(amount) => setAmountsWithUsd(amount * 100)}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  minValue={0}
                  style={Styles.walletBalanceInput}
                  editable={!isFixedAmountInvoice}
                />
              )}
            </View>
            {fromWallet.walletCurrency === WalletCurrency.Btc && !fixedAmount && (
              <TouchableWithoutFeedback onPress={toggleAmountCurrency}>
                <View style={Styles.switchCurrencyIconContainer}>
                  <SwitchIcon />
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
          {lnurlParams && (
            <Text>
              Min:{" "}
              {fromWallet.walletCurrency === WalletCurrency.Usd
                ? convertPaymentAmount(
                    { amount: lnurlParams.min, currency: WalletCurrency.Btc },
                    WalletCurrency.Usd,
                  ).amount / 100
                : lnurlParams.min}{" "}
              - Max:{" "}
              {fromWallet.walletCurrency === WalletCurrency.Usd
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
                onChangeText={setNote}
                value={note}
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
            disabled={!validAmount || paymentAmount.amount === 0}
            onPress={goToNextScreen}
          />
        </View>
      </View>
    </ScrollView>
  )
}

export default SendBitcoinDetailsScreen
