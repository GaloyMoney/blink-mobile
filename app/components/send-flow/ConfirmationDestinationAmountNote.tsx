import React from "react"
import { View } from "react-native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles, Text, useTheme } from "@rneui/themed"

// components
import { AmountInput } from "@app/components/amount-input"
import { PaymentDestinationDisplay } from "@app/components/payment-destination-display"

// assets
import DestinationIcon from "@app/assets/icons/destination.svg"
import NoteIcon from "@app/assets/icons/note.svg"

// types
import { PaymentDetail } from "@app/screens/send-bitcoin-screen/payment-details"
import { WalletCurrency } from "@app/graphql/generated"

type Props = {
  paymentDetail: PaymentDetail<WalletCurrency>
}

const ConfirmationDestinationAmountNote: React.FC<Props> = ({ paymentDetail }) => {
  const { LL } = useI18nContext()
  const { colors } = useTheme().theme
  const styles = useStyles()

  const {
    destination,
    paymentType,
    sendingWalletDescriptor,
    memo: note,
    unitOfAccountAmount,
    convertMoneyAmount,
    isSendingMax,
  } = paymentDetail

  return (
    <>
      {(paymentType === "intraledger" || paymentType === "lnurl") && (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.destination()}</Text>
          <View style={styles.fieldBackground}>
            <View style={styles.destinationIconContainer}>
              <DestinationIcon fill={colors.black} />
            </View>
            <PaymentDestinationDisplay
              destination={destination}
              paymentType={paymentType}
            />
          </View>
        </View>
      )}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.amount()}</Text>
        <AmountInput
          unitOfAccountAmount={unitOfAccountAmount}
          canSetAmount={false}
          isSendingMax={isSendingMax}
          convertMoneyAmount={convertMoneyAmount}
          walletCurrency={sendingWalletDescriptor.currency}
        />
      </View>
      {note ? (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>
          <View style={styles.fieldBackground}>
            <View style={styles.noteIconContainer}>
              <NoteIcon style={styles.noteIcon} />
            </View>
            <Text>{note}</Text>
          </View>
        </View>
      ) : null}
    </>
  )
}

export default ConfirmationDestinationAmountNote

const useStyles = makeStyles(({ colors }) => ({
  fieldContainer: {
    marginBottom: 12,
  },
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
  fieldTitleText: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  destinationIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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
}))
