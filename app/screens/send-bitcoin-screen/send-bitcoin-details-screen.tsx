import { gql } from "@apollo/client"
import NoteIcon from "@app/assets/icons/note.svg"
import { AmountInput } from "@app/components/amount-input/amount-input"
import { Screen } from "@app/components/screen"
import {
  useSendBitcoinDetailsScreenQuery,
  useSendBitcoinInternalLimitsQuery,
  useSendBitcoinWithdrawalLimitsQuery,
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
  MoneyAmount,
  toBtcMoneyAmount,
  toUsdMoneyAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"
import { fetchLnurlInvoice, Network as NetworkLibGaloy } from "@galoymoney/client"
import { decodeInvoiceString } from "@galoymoney/client/dist/parsing-v2"
import crashlytics from "@react-native-firebase/crashlytics"
import { NavigationProp, RouteProp, useNavigation } from "@react-navigation/native"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { Satoshis } from "lnurl-pay/dist/types/types"
import React, { useEffect, useState } from "react"
import { TextInput, TouchableWithoutFeedback, View } from "react-native"
import ReactNativeModal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { testProps } from "../../utils/testProps"
import { PaymentDetail } from "./payment-details/index.types"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { isValidAmount } from "./payment-details"
import { useLevel } from "@app/graphql/level-context"
import { SendBitcoinDetailsExtraInfo } from "./send-bitcoin-details-extra-info"

const useStyles = makeStyles(({ colors }) => ({
  sendBitcoinAmountContainer: {
    flex: 1,
  },
  fieldBackground: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: colors.grey4,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    height: 60,
  },
  walletContainer: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: colors.grey4,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
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
    backgroundColor: palette.lightOrange,
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
  walletCurrencyText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  walletSelectorTypeTextContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  walletSelectorBalanceContainer: {
    flex: 1,
    flexDirection: "row",
  },
  fieldTitleText: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  currencyInputContainer: {
    flexDirection: "column",
  },
  switchCurrencyIconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
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
    color: colors.black,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modal: {
    marginBottom: "90%",
  },
  pickWalletIcon: {
    marginRight: 12,
  },
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
}))

gql`
  query sendBitcoinDetailsScreen {
    globals {
      network
    }
    me {
      id
      defaultAccount {
        id
        defaultWalletId
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

gql`
  query sendBitcoinWithdrawalLimits {
    me {
      id
      defaultAccount {
        id
        limits {
          withdrawal {
            totalLimit
            remainingLimit
            interval
          }
        }
      }
    }
  }
`

gql`
  query sendBitcoinInternalLimits {
    me {
      id
      defaultAccount {
        id
        limits {
          internalSend {
            totalLimit
            remainingLimit
            interval
          }
        }
      }
    }
  }
`

type Props = {
  route: RouteProp<RootStackParamList, "sendBitcoinDetails">
}

const SendBitcoinDetailsScreen: React.FC<Props> = ({ route }) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const navigation =
    useNavigation<NavigationProp<RootStackParamList, "sendBitcoinDetails">>()

  const { currentLevel } = useLevel()

  const { data } = useSendBitcoinDetailsScreenQuery({
    fetchPolicy: "cache-first",
    returnPartialData: true,
    skip: !useIsAuthed(),
  })

  const { formatDisplayAndWalletAmount } = useDisplayCurrency()
  const { LL } = useI18nContext()
  const [isLoadingLnurl, setIsLoadingLnurl] = useState(false)

  const { convertMoneyAmount: _convertMoneyAmount } = usePriceConversion()
  const { zeroDisplayAmount } = useDisplayCurrency()

  const defaultWallet = data?.me?.defaultAccount?.defaultWallet
  const btcWallet = data?.me?.defaultAccount?.btcWallet
  const network = data?.globals?.network

  const wallets = data?.me?.defaultAccount?.wallets
  const { paymentDestination } = route.params

  const [paymentDetail, setPaymentDetail] =
    useState<PaymentDetail<WalletCurrency> | null>(null)

  const { data: withdrawalLimitsData } = useSendBitcoinWithdrawalLimitsQuery({
    fetchPolicy: "no-cache",
    skip:
      !useIsAuthed() ||
      !paymentDetail?.paymentType ||
      paymentDetail.paymentType === "intraledger",
  })

  const { data: intraledgerLimitsData } = useSendBitcoinInternalLimitsQuery({
    fetchPolicy: "no-cache",
    skip:
      !useIsAuthed() ||
      !paymentDetail?.paymentType ||
      paymentDetail.paymentType !== "intraledger",
  })

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [asyncErrorMessage, setAsyncErrorMessage] = useState("")

  // we are caching the _convertMoneyAmount when the screen loads.
  // this is because the _convertMoneyAmount can change while the user is on this screen
  // and we don't want to update the payment detail with a new convertMoneyAmount
  useEffect(() => {
    if (!_convertMoneyAmount) {
      return
    }

    setPaymentDetail(
      (paymentDetail) =>
        paymentDetail && paymentDetail.setConvertMoneyAmount(_convertMoneyAmount),
    )
  }, [_convertMoneyAmount, setPaymentDetail])

  // we set the default values when the screen loads
  // this only run once (doesn't re-run after paymentDetail is set)
  useEffect(() => {
    if (paymentDetail || !defaultWallet || !_convertMoneyAmount) {
      return
    }

    let initialPaymentDetail = paymentDestination.createPaymentDetail({
      convertMoneyAmount: _convertMoneyAmount,
      sendingWalletDescriptor: {
        id: defaultWallet.id,
        currency: defaultWallet.walletCurrency,
      },
    })

    // Start with usd as the unit of account
    if (initialPaymentDetail.canSetAmount) {
      initialPaymentDetail = initialPaymentDetail.setAmount(zeroDisplayAmount)
    }

    setPaymentDetail(initialPaymentDetail)
  }, [
    setPaymentDetail,
    paymentDestination,
    _convertMoneyAmount,
    paymentDetail,
    defaultWallet,
    btcWallet,
    zeroDisplayAmount,
  ])

  if (!paymentDetail) {
    return <></>
  }

  const { sendingWalletDescriptor, convertMoneyAmount } = paymentDetail
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

  const amountStatus = isValidAmount({
    paymentDetail,
    usdWalletAmount: usdBalanceMoneyAmount,
    btcWalletAmount: btcBalanceMoneyAmount,
    intraledgerLimits: intraledgerLimitsData?.me?.defaultAccount?.limits?.internalSend,
    withdrawalLimits: withdrawalLimitsData?.me?.defaultAccount?.limits?.withdrawal,
  })

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
  }

  const chooseWallet = (wallet: Pick<Wallet, "id" | "walletCurrency">) => {
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

  const ChooseWalletModal = wallets && (
    <ReactNativeModal
      style={styles.modal}
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
              <View style={styles.walletContainer}>
                <View style={styles.walletSelectorTypeContainer}>
                  <View
                    style={
                      wallet.walletCurrency === WalletCurrency.Btc
                        ? styles.walletSelectorTypeLabelBitcoin
                        : styles.walletSelectorTypeLabelUsd
                    }
                  >
                    {wallet.walletCurrency === WalletCurrency.Btc ? (
                      <Text style={styles.walletSelectorTypeLabelBtcText}>BTC</Text>
                    ) : (
                      <Text style={styles.walletSelectorTypeLabelUsdText}>USD</Text>
                    )}
                  </View>
                </View>
                <View style={styles.walletSelectorInfoContainer}>
                  <View style={styles.walletSelectorTypeTextContainer}>
                    {wallet.walletCurrency === WalletCurrency.Btc ? (
                      <Text
                        style={styles.walletCurrencyText}
                      >{`${LL.common.btcAccount()}`}</Text>
                    ) : (
                      <Text
                        style={styles.walletCurrencyText}
                      >{`${LL.common.usdAccount()}`}</Text>
                    )}
                  </View>
                  <View style={styles.walletSelectorBalanceContainer}>
                    {wallet.walletCurrency === WalletCurrency.Btc ? (
                      <Text>{btcWalletText}</Text>
                    ) : (
                      <Text>{usdWalletText}</Text>
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
    (paymentDetail.sendPaymentMutation ||
      (paymentDetail.paymentType === "lnurl" && paymentDetail.unitOfAccountAmount)) &&
    (async () => {
      let paymentDetailForConfirmation: PaymentDetail<WalletCurrency> = paymentDetail

      if (paymentDetail.paymentType === "lnurl") {
        try {
          setIsLoadingLnurl(true)

          const btcAmount = paymentDetail.convertMoneyAmount(
            paymentDetail.unitOfAccountAmount,
            "BTC",
          )

          const result = await fetchLnurlInvoice({
            lnUrlOrAddress: paymentDetail.destination,
            tokens: btcAmount.amount as Satoshis,
          })
          setIsLoadingLnurl(false)
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
          setIsLoadingLnurl(false)
          if (error instanceof Error) {
            crashlytics().recordError(error)
          }
          setAsyncErrorMessage(LL.SendBitcoinScreen.failedToFetchLnurlInvoice())
          return
        }
      }

      if (paymentDetailForConfirmation.sendPaymentMutation) {
        navigation.navigate("sendBitcoinConfirmation", {
          paymentDetail: paymentDetailForConfirmation,
        })
      }
    })

  const setAmount = (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>) => {
    setPaymentDetail((paymentDetail) =>
      paymentDetail?.setAmount ? paymentDetail.setAmount(moneyAmount) : paymentDetail,
    )
  }

  return (
    <Screen
      preset="scroll"
      style={styles.screenStyle}
      keyboardOffset="navigationHeader"
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.sendBitcoinAmountContainer}>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldTitleText}>{LL.common.from()}</Text>
          <TouchableWithoutFeedback onPress={toggleModal} accessible={false}>
            <View style={styles.fieldBackground}>
              <View style={styles.walletSelectorTypeContainer}>
                <View
                  style={
                    sendingWalletDescriptor.currency === WalletCurrency.Btc
                      ? styles.walletSelectorTypeLabelBitcoin
                      : styles.walletSelectorTypeLabelUsd
                  }
                >
                  {sendingWalletDescriptor.currency === WalletCurrency.Btc ? (
                    <Text style={styles.walletSelectorTypeLabelBtcText}>BTC</Text>
                  ) : (
                    <Text style={styles.walletSelectorTypeLabelUsdText}>USD</Text>
                  )}
                </View>
              </View>
              <View style={styles.walletSelectorInfoContainer}>
                <View style={styles.walletSelectorTypeTextContainer}>
                  {sendingWalletDescriptor.currency === WalletCurrency.Btc ? (
                    <>
                      <Text style={styles.walletCurrencyText}>
                        {LL.common.btcAccount()}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.walletCurrencyText}>
                        {LL.common.usdAccount()}
                      </Text>
                    </>
                  )}
                </View>
                <View style={styles.walletSelectorBalanceContainer}>
                  <Text
                    {...testProps(`${sendingWalletDescriptor.currency} Wallet Balance`)}
                  >
                    {sendingWalletDescriptor.currency === WalletCurrency.Btc
                      ? btcWalletText
                      : usdWalletText}
                  </Text>
                </View>
                <View />
              </View>

              <View style={styles.pickWalletIcon}>
                <Icon name={"chevron-down"} size={24} color={colors.black} />
              </View>
            </View>
          </TouchableWithoutFeedback>
          {ChooseWalletModal}
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.amount()}</Text>
          <View style={styles.currencyInputContainer}>
            <AmountInput
              unitOfAccountAmount={paymentDetail.unitOfAccountAmount}
              setAmount={setAmount}
              convertMoneyAmount={paymentDetail.convertMoneyAmount}
              walletCurrency={sendingWalletDescriptor.currency}
              canSetAmount={paymentDetail.canSetAmount}
              maxAmount={lnurlParams?.max ? toBtcMoneyAmount(lnurlParams.max) : undefined}
              minAmount={lnurlParams?.min ? toBtcMoneyAmount(lnurlParams.min) : undefined}
            />
          </View>
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>
          <View style={styles.fieldBackground}>
            <View style={styles.noteContainer}>
              <View style={styles.noteIconContainer}>
                <NoteIcon style={styles.noteIcon} />
              </View>
              <TextInput
                style={styles.noteInput}
                placeholder={LL.SendBitcoinScreen.note()}
                placeholderTextColor={colors.grey3}
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
        <SendBitcoinDetailsExtraInfo
          errorMessage={asyncErrorMessage}
          amountStatus={amountStatus}
          currentLevel={currentLevel}
        />
        <View style={styles.buttonContainer}>
          <GaloyPrimaryButton
            {...testProps(LL.common.next())}
            onPress={goToNextScreen || undefined}
            loading={isLoadingLnurl}
            disabled={!goToNextScreen || !amountStatus.validAmount}
            title={LL.common.next()}
          />
        </View>
      </View>
    </Screen>
  )
}

export default SendBitcoinDetailsScreen
