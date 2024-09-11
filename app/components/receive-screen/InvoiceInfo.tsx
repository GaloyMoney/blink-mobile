import React from "react"
import moment from "moment"
import { Share, TouchableOpacity, View } from "react-native"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"
import Icon from "react-native-vector-icons/Ionicons"

// types
import {
  Invoice,
  PaymentRequestState,
} from "@app/screens/receive-bitcoin-screen/payment/index.types"

// utils
import { testProps } from "../../utils/testProps"

type Props = {
  request: any
  lnurlp?: string
  handleCopy: () => void
}

const InvoiceInfo: React.FC<Props> = ({ request, lnurlp, handleCopy }) => {
  const { colors } = useTheme().theme
  const styles = useStyles()
  const { LL } = useI18nContext()

  const handleShare = async () => {
    if (!!lnurlp) {
      const result = await Share.share({ message: lnurlp })
    } else {
      if (request.share) {
        request.share()
      }
    }
  }

  if (request.state !== PaymentRequestState.Loading) {
    return (
      <>
        {request.info?.data?.invoiceType === Invoice.Lightning && (
          <View style={styles.invoiceDetails}>
            <Text color={colors.grey2}>
              {request.state === PaymentRequestState.Expired
                ? LL.ReceiveScreen.invoiceHasExpired()
                : `Valid for ${moment(request.info.data.expiresAt).fromNow(true)}`}
            </Text>
          </View>
        )}
        {request.readablePaymentRequest && (
          <View style={styles.extraDetails}>
            <TouchableOpacity onPress={handleCopy}>
              <Text {...testProps("readable-payment-request")}>
                {request.readablePaymentRequest}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.shareInvoice}>
              <Icon color={colors.grey2} name="share-outline" size={20} />
            </TouchableOpacity>
          </View>
        )}
      </>
    )
  } else {
    return null
  }
}

export default InvoiceInfo

const useStyles = makeStyles(({ colors }) => ({
  extraDetails: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  invoiceDetails: {
    alignItems: "center",
    marginBottom: 10,
  },
  shareInvoice: {
    marginLeft: 5,
  },
}))
