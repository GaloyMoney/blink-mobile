import React from "react"
import { View } from "react-native"
import { makeStyles, Text } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"

// types
import { WalletCurrency } from "@app/graphql/generated"
import { PaymentDetail } from "@app/screens/send-bitcoin-screen/payment-details"

type Props = {
  flashUserAddress?: string
  paymentDetail: PaymentDetail<WalletCurrency>
}

const DetailDestination: React.FC<Props> = ({ flashUserAddress, paymentDetail }) => {
  const { LL } = useI18nContext()
  const styles = useStyles()

  if (
    paymentDetail.paymentType === "intraledger" ||
    (paymentDetail.paymentType === "lnurl" && !!paymentDetail.lnurlParams.identifier)
  ) {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldTitleText}>{LL.common.to()}</Text>

        <View style={styles.fieldBackground}>
          <View style={styles.walletSelectorInfoContainer}>
            <Text>
              {flashUserAddress?.split("@")[0] === paymentDetail.destination
                ? flashUserAddress
                : paymentDetail.destination}
            </Text>
          </View>
        </View>
      </View>
    )
  } else {
    return null
  }
}

export default DetailDestination

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
  walletSelectorInfoContainer: {
    flex: 1,
    flexDirection: "column",
  },
  fieldTitleText: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  fieldContainer: {
    marginBottom: 12,
  },
}))
