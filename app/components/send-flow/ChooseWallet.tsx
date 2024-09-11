import React, { useState } from "react"
import { TouchableWithoutFeedback, View } from "react-native"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"
import Icon from "react-native-vector-icons/Ionicons"
import ReactNativeModal from "react-native-modal"

// types
import { testProps } from "../../utils/testProps"

// hooks
import { useBreez } from "@app/hooks"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { usePersistentStateContext } from "@app/store/persistent-state"

// types
import { DisplayCurrency, toBtcMoneyAmount, toUsdMoneyAmount } from "@app/types/amounts"
import { Wallet, WalletCurrency } from "@app/graphql/generated"
import { PaymentDetail } from "@app/screens/send-bitcoin-screen/payment-details"

type Props = {
  usdWallet: any
  wallets: any[]
  paymentDetail: PaymentDetail<WalletCurrency>
  setPaymentDetail: (val: PaymentDetail<WalletCurrency>) => void
}

const ChooseWallet: React.FC<Props> = ({
  usdWallet,
  wallets,
  paymentDetail,
  setPaymentDetail,
}) => {
  const styles = useStyles()
  const { colors } = useTheme().theme
  const { LL } = useI18nContext()
  const { btcWallet } = useBreez()
  const { persistentState } = usePersistentStateContext()

  const [isModalVisible, setIsModalVisible] = useState(false)

  const { formatDisplayAndWalletAmount } = useDisplayCurrency()
  const { sendingWalletDescriptor, convertMoneyAmount } = paymentDetail

  const btcBalanceMoneyAmount = toBtcMoneyAmount(btcWallet.balance || btcWallet?.balance)
  const usdBalanceMoneyAmount = toUsdMoneyAmount(usdWallet?.balance)

  const btcWalletText = formatDisplayAndWalletAmount({
    displayAmount: convertMoneyAmount(btcBalanceMoneyAmount, DisplayCurrency),
    walletAmount: btcBalanceMoneyAmount,
  })
  const usdWalletText = formatDisplayAndWalletAmount({
    displayAmount: convertMoneyAmount(usdBalanceMoneyAmount, DisplayCurrency),
    walletAmount: usdBalanceMoneyAmount,
  })

  const toggleModal = () => {
    if (persistentState.isAdvanceMode) setIsModalVisible(!isModalVisible)
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

  if (persistentState.isAdvanceMode && btcWallet) {
    wallets = [...wallets, btcWallet]
  }

  return (
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
                  <Text style={styles.walletCurrencyText}>{LL.common.btcAccount()}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.walletCurrencyText}>{LL.common.usdAccount()}</Text>
                </>
              )}
            </View>
            <View style={styles.walletSelectorBalanceContainer}>
              <Text {...testProps(`${sendingWalletDescriptor.currency} Wallet Balance`)}>
                {sendingWalletDescriptor.currency === WalletCurrency.Btc
                  ? btcWalletText
                  : usdWalletText}
              </Text>
            </View>
            <View />
          </View>

          {persistentState.isAdvanceMode && (
            <View style={styles.pickWalletIcon}>
              <Icon name={"chevron-down"} size={24} color={colors.black} />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      <ReactNativeModal
        style={styles.modal}
        animationIn="fadeInDown"
        animationOut="fadeOutUp"
        isVisible={isModalVisible}
        onBackButtonPress={toggleModal}
        onBackdropPress={toggleModal}
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
    </View>
  )
}

export default ChooseWallet

const useStyles = makeStyles(({ colors }) => ({
  fieldBackground: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: colors.grey5,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    height: 60,
  },
  walletContainer: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: colors.grey5,
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
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  walletSelectorTypeLabelUsd: {
    height: 30,
    width: 50,
    backgroundColor: colors.green,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  walletSelectorTypeLabelUsdText: {
    fontWeight: "bold",
    color: colors.black,
  },
  walletSelectorTypeLabelBtcText: {
    fontWeight: "bold",
    color: colors.white,
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
  modal: {
    marginBottom: "90%",
  },
  pickWalletIcon: {
    marginRight: 12,
  },
}))
