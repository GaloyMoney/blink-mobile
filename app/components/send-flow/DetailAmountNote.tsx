import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { makeStyles, Text } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useAppConfig, useBreez } from "@app/hooks"
import { parse } from "@breeztech/react-native-breez-sdk-liquid"

// components
import { GaloyTertiaryButton } from "@app/components/atomic/galoy-tertiary-button"
import { AmountInput } from "@app/components/amount-input/amount-input"
import { NoteInput } from "@app/components/note-input"

// types
import { PaymentDetail } from "@app/screens/send-bitcoin-screen/payment-details"
import { WalletCurrency } from "@app/graphql/generated"
import { MoneyAmount, WalletOrDisplayCurrency } from "@app/types/amounts"

// utils
import { testProps } from "../../utils/testProps"
import {
  fetchBreezLightningLimits,
  fetchBreezOnChainLimits,
} from "@app/utils/breez-sdk-liquid"

type Props = {
  usdWallet: any
  paymentDetail: PaymentDetail<WalletCurrency>
  setPaymentDetail: (val: PaymentDetail<WalletCurrency>) => void
  setAsyncErrorMessage: (val: string) => void
}

const DetailAmountNote: React.FC<Props> = ({
  usdWallet,
  paymentDetail,
  setPaymentDetail,
  setAsyncErrorMessage,
}) => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { btcWallet } = useBreez()
  const { sendingWalletDescriptor } = paymentDetail
  const { lnAddressHostname: lnDomain } = useAppConfig().appConfig.galoyInstance

  const [minAmount, setMinAmount] = useState<MoneyAmount<WalletOrDisplayCurrency>>()
  const [maxAmount, setMaxAmount] = useState<MoneyAmount<WalletOrDisplayCurrency>>()

  useEffect(() => {
    if (paymentDetail?.sendingWalletDescriptor.currency === "BTC") {
      if (paymentDetail.paymentType === "lightning" && paymentDetail.canSetAmount) {
        setAsyncErrorMessage(LL.SendBitcoinScreen.noAmountInvoiceError())
      } else if (
        minAmount &&
        paymentDetail.settlementAmount.amount &&
        paymentDetail.settlementAmount.amount < minAmount?.amount
      ) {
        setAsyncErrorMessage(
          LL.SendBitcoinScreen.minAmountInvoiceError({ amount: minAmount?.amount }),
        )
      } else if (
        maxAmount &&
        paymentDetail.settlementAmount.amount &&
        paymentDetail.settlementAmount.amount > maxAmount?.amount
      ) {
        setAsyncErrorMessage(
          LL.SendBitcoinScreen.maxAmountInvoiceError({ amount: maxAmount.amount }),
        )
      } else {
        setAsyncErrorMessage("")
      }
    } else {
      if (paymentDetail?.paymentType === "lnurl") {
        if (paymentDetail.settlementAmount.amount < paymentDetail?.lnurlParams.min) {
          setAsyncErrorMessage(
            LL.SendBitcoinScreen.minAmountInvoiceError({
              amount: paymentDetail?.lnurlParams.min,
            }),
          )
        } else if (
          paymentDetail.settlementAmount.amount > paymentDetail?.lnurlParams.max
        ) {
          setAsyncErrorMessage(
            LL.SendBitcoinScreen.maxAmountInvoiceError({
              amount: paymentDetail?.lnurlParams.max,
            }),
          )
        } else {
          setAsyncErrorMessage("")
        }
      } else {
        setAsyncErrorMessage("")
      }
    }
  }, [paymentDetail, minAmount, maxAmount])

  useEffect(() => {
    if (paymentDetail.sendingWalletDescriptor.currency === "BTC") fetchBtcMinMaxAmount()
  }, [])

  const fetchBtcMinMaxAmount = async () => {
    let limits
    if (paymentDetail.paymentType === "lightning") {
      limits = await fetchBreezLightningLimits()
    } else if (paymentDetail.paymentType === "onchain") {
      limits = await fetchBreezOnChainLimits()
    } else {
      const destination =
        paymentDetail.paymentType === "lnurl"
          ? paymentDetail.destination
          : paymentDetail.destination + `@${lnDomain}`
      const invoice: any = await parse(destination)
      limits = {
        send: {
          minSat: invoice?.data?.minSendable,
          maxSat: invoice?.data?.maxSendable,
        },
      }
    }

    setMinAmount({
      amount: limits?.send.minSat || 0,
      currency: "BTC",
      currencyCode: "SAT",
    })
    setMaxAmount({
      amount: limits?.send.maxSat || 0,
      currency: "BTC",
      currencyCode: "SAT",
    })
  }

  const sendAll = () => {
    let moneyAmount: MoneyAmount<WalletCurrency>

    if (paymentDetail.sendingWalletDescriptor.currency === WalletCurrency.Btc) {
      moneyAmount = {
        amount: btcWallet.balance ?? 0,
        currency: WalletCurrency.Btc,
        currencyCode: "BTC",
      }
    } else {
      moneyAmount = {
        amount: usdWallet?.balance ?? 0,
        currency: WalletCurrency.Usd,
        currencyCode: "USD",
      }
    }

    setPaymentDetail(
      paymentDetail?.setAmount
        ? paymentDetail.setAmount(moneyAmount, true)
        : paymentDetail,
    )
  }

  const setAmount = (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>) => {
    setPaymentDetail(
      paymentDetail?.setAmount ? paymentDetail.setAmount(moneyAmount) : paymentDetail,
    )
  }

  return (
    <>
      <View style={styles.fieldContainer}>
        <View style={styles.amountRightMaxField}>
          <Text {...testProps(LL.SendBitcoinScreen.amount())} style={styles.amountText}>
            {LL.SendBitcoinScreen.amount()}
          </Text>
          {paymentDetail.canSendMax && !paymentDetail.isSendingMax && (
            <GaloyTertiaryButton
              clear
              title={LL.SendBitcoinScreen.maxAmount()}
              onPress={sendAll}
            />
          )}
        </View>
        <View style={styles.currencyInputContainer}>
          <AmountInput
            unitOfAccountAmount={paymentDetail.unitOfAccountAmount}
            setAmount={setAmount}
            convertMoneyAmount={paymentDetail.convertMoneyAmount}
            walletCurrency={sendingWalletDescriptor.currency}
            canSetAmount={paymentDetail.canSetAmount}
            isSendingMax={paymentDetail.isSendingMax}
            maxAmount={
              paymentDetail.sendingWalletDescriptor.currency === "BTC"
                ? maxAmount
                : undefined
            }
            minAmount={
              paymentDetail.sendingWalletDescriptor.currency === "BTC"
                ? minAmount
                : undefined
            }
          />
        </View>
      </View>
      {paymentDetail.paymentType === "intraledger" && (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>
          <NoteInput
            onChangeText={(text) =>
              paymentDetail.setMemo && setPaymentDetail(paymentDetail.setMemo(text))
            }
            value={paymentDetail.memo || ""}
            editable={paymentDetail.canSetMemo}
          />
        </View>
      )}
    </>
  )
}

export default DetailAmountNote

const useStyles = makeStyles(({ colors }) => ({
  sendBitcoinAmountContainer: {
    flex: 1,
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
  amountText: {
    fontWeight: "bold",
  },
  amountRightMaxField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    height: 18,
  },
}))
