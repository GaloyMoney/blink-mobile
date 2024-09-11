import React from "react"
import { View } from "react-native"
import { makeStyles, Text } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"

// types
import { Invoice } from "@app/screens/receive-bitcoin-screen/payment/index.types"

type Props = {
  request: any
}

const OnChainCharge: React.FC<Props> = ({ request }) => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  if (
    request.receivingWalletDescriptor.currency === "USD" &&
    request.feesInformation?.deposit.minBankFee &&
    request.feesInformation?.deposit.minBankFeeThreshold &&
    request.type === Invoice.OnChain
  ) {
    return (
      <View style={styles.onchainCharges}>
        <Text type="p4">
          {LL.ReceiveScreen.fees({
            minBankFee: request.feesInformation?.deposit.minBankFee,
            minBankFeeThreshold: request.feesInformation?.deposit.minBankFeeThreshold,
          })}
        </Text>
      </View>
    )
  } else {
    return null
  }
}

export default OnChainCharge

const useStyles = makeStyles(({ colors }) => ({
  onchainCharges: { marginTop: 10, alignItems: "center" },
}))
