import * as React from "react"
import { ActivityIndicator, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

import { translate } from "../../i18n"
import { currencyToTextWithUnits } from "../../utils/currencyConversion"
import { palette } from "../../theme/palette"

type PaymentConfirmationInformationProps = {
  fee: number | null | undefined
  feeText: string
  destination: string
  primaryAmount: MoneyAmount
  secondaryAmount: MoneyAmount
  primaryTotalAmount: MoneyAmount
  secondaryTotalAmount: MoneyAmount
}

export const PaymentConfirmationInformation = ({
  fee,
  feeText,
  destination,
  primaryAmount,
  secondaryAmount,
  primaryTotalAmount,
  secondaryTotalAmount,
}: PaymentConfirmationInformationProps): JSX.Element => {
  return (
    <View style={styles.paymentInformation}>
      <View style={styles.paymentInformationRow}>
        <Text style={styles.paymentInformationLabel}>
          {translate("SendBitcoinConfirmationScreen.destinationLabel")}
        </Text>
        {destination && <Text style={styles.paymentInformationData}>{destination}</Text>}
      </View>

      <View style={styles.paymentInformationRow}>
        <Text style={styles.paymentInformationLabel}>
          {translate("SendBitcoinConfirmationScreen.amountLabel")}
        </Text>
        <Text style={styles.paymentInformationMainAmount}>
          {currencyToTextWithUnits(primaryAmount)}
        </Text>
        <Text style={styles.paymentInformationSecondaryAmount}>
          {currencyToTextWithUnits(secondaryAmount)}
        </Text>
      </View>

      <View style={styles.paymentInformationRow}>
        <Text style={styles.paymentInformationLabel}>
          {translate("SendBitcoinConfirmationScreen.feeLabel")}
        </Text>
        <FeeDetails fee={fee} feeText={feeText} />
      </View>

      {!(fee === null || fee === undefined || fee === -1) && (
        <View style={styles.paymentInformationRow}>
          <Text style={styles.paymentInformationLabel}>
            {translate("SendBitcoinConfirmationScreen.totalLabel")}
          </Text>
          <Text style={styles.paymentInformationMainAmount}>
            {currencyToTextWithUnits(primaryTotalAmount)}
          </Text>
          <Text style={styles.paymentInformationSecondaryAmount}>
            {currencyToTextWithUnits(secondaryTotalAmount)}
          </Text>
        </View>
      )}
    </View>
  )
}

type FeeDetailsProps = {
  fee: number | null | undefined
  feeText: string
}

const FeeDetails = ({ fee, feeText }: FeeDetailsProps): JSX.Element => {
  if (fee === undefined) {
    return (
      <ActivityIndicator
        style={[styles.activityIndicator, styles.paymentInformationData]}
        animating
        size="small"
        color={palette.orange}
      />
    )
  }

  if (fee === -1) {
    return (
      <Text style={styles.paymentInformationData}>
        {translate("SendBitcoinScreen.feeCalculationUnsuccessful")}
      </Text>
    ) // todo: same calculation as backend
  }

  return <Text style={styles.paymentInformationData}>{feeText}</Text>
}

const styles = EStyleSheet.create({
  activityIndicator: {
    alignItems: "flex-start",
  },

  paymentInformation: {
    flex: 1,
    marginTop: "32rem",
  },

  paymentInformationData: {
    flex: 5,
    fontSize: "18rem",
    textAlignVertical: "bottom",
  },

  paymentInformationLabel: {
    flex: 2,
    fontSize: "18rem",
  },

  paymentInformationMainAmount: {
    flex: 3,
    fontSize: "18rem",
    textAlignVertical: "bottom",
  },

  paymentInformationRow: {
    flexDirection: "row",
    marginBottom: "12rem",
  },

  paymentInformationSecondaryAmount: {
    color: palette.midGrey,
    flex: 2,
    fontSize: "14rem",
    textAlignVertical: "bottom",
  },
})
