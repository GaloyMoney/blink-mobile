import * as React from "react"
import { ActivityIndicator, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

import { currencyToTextWithUnits } from "../../utils/currencyConversion"
import { palette } from "../../theme/palette"
import { useI18nContext } from "@app/i18n/i18n-react"

type FeeType = {
  value: number | null | undefined
  status: string
  text: string
}

type FeeDetailsProps = {
  fee: FeeType
}

type PaymentConfirmationInformationProps = {
  fee: FeeType
  destination: string
  memo: string
  primaryAmount: MoneyAmount
  secondaryAmount: MoneyAmount
  primaryTotalAmount: MoneyAmount
  secondaryTotalAmount: MoneyAmount
}

export const PaymentConfirmationInformation = ({
  fee,
  destination,
  memo,
  primaryAmount,
  secondaryAmount,
  primaryTotalAmount,
  secondaryTotalAmount,
}: PaymentConfirmationInformationProps): JSX.Element => {
  const { LL } = useI18nContext()
  return (
    <View style={styles.paymentInformation}>
      <View style={styles.paymentInformationRow}>
        <Text style={styles.paymentInformationLabel}>
          {LL.SendBitcoinConfirmationScreen.destinationLabel()}
        </Text>
        {destination?.length > 0 && (
          <Text style={styles.paymentInformationData}>{destination}</Text>
        )}
      </View>

      {memo?.length > 0 && (
        <View style={styles.paymentInformationRow}>
          <Text style={styles.paymentInformationLabel}>
            {LL.SendBitcoinConfirmationScreen.memoLabel()}
          </Text>
          <Text style={styles.paymentInformationData}>{memo}</Text>
        </View>
      )}

      {fee.value === null && (
        <View style={styles.paymentInformationRow}>
          <Text style={styles.paymentInformationLabel}>
            {LL.SendBitcoinConfirmationScreen.amountLabel()}
          </Text>
          <Text style={styles.paymentInformationMainAmount}>
            {currencyToTextWithUnits(primaryAmount)}
          </Text>
          <Text style={styles.paymentInformationSecondaryAmount}>
            {currencyToTextWithUnits(secondaryAmount)}
          </Text>
        </View>
      )}

      {fee.value !== null && (
        <View style={styles.paymentInformationRow}>
          <Text style={styles.paymentInformationLabel}>
            {LL.SendBitcoinConfirmationScreen.totalLabel()}
          </Text>
          <Text style={styles.paymentInformationMainAmount}>
            {currencyToTextWithUnits(primaryTotalAmount)}
          </Text>
          <Text style={styles.paymentInformationSecondaryAmount}>
            {currencyToTextWithUnits(secondaryTotalAmount)}
          </Text>
        </View>
      )}

      <View style={styles.paymentInformationRow}>
        <Text style={styles.paymentInformationLabel}>
          {LL.SendBitcoinConfirmationScreen.feeLabel()}
        </Text>
        <FeeDetails fee={fee} />
      </View>
    </View>
  )
}

const FeeDetails = ({ fee }: FeeDetailsProps): JSX.Element => {
  const { LL } = useI18nContext()
  if (fee.status === "loading") {
    return (
      <ActivityIndicator
        style={[styles.activityIndicator, styles.paymentInformationData]}
        animating
        size="small"
        color={palette.orange}
      />
    )
  }

  if (fee.status === "error") {
    return (
      <Text style={styles.paymentInformationData}>
        {LL.SendBitcoinScreen.feeCalculationUnsuccessful()}
      </Text>
    ) // todo: same calculation as backend
  }

  return <Text style={styles.paymentInformationData}>{fee.text}</Text>
}

const styles = EStyleSheet.create({
  activityIndicator: {
    alignItems: "flex-start",
  },

  paymentInformation: {
    color: palette.midGrey,
    flex: 1,
    marginTop: "32rem",
  },

  paymentInformationData: {
    color: palette.midGrey,
    flex: 5,
    fontSize: "18rem",
    textAlignVertical: "bottom",
  },

  paymentInformationLabel: {
    color: palette.midGrey,
    flex: 2,
    fontSize: "18rem",
  },

  paymentInformationMainAmount: {
    color: palette.midGrey,
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
    fontSize: "18rem",
    textAlignVertical: "bottom",
  },
})
