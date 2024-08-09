import React from "react"
import { Share, TouchableOpacity, View } from "react-native"
import { RouteProp } from "@react-navigation/native"
import Clipboard from "@react-native-clipboard/clipboard"
import Icon from "react-native-vector-icons/Ionicons"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles, Text, useTheme } from "@rneui/themed"

// components
import { Screen } from "@app/components/screen"
import { QRView } from "../receive-bitcoin-screen/qr-view"

// utils
import { testProps } from "../../utils/testProps"

// types
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { Invoice } from "../receive-bitcoin-screen/payment/index.types"

type Props = {
  route: RouteProp<RootStackParamList, "flashcardTopup">
}

export const FlashcardTopup = ({ route }: Props) => {
  const { colors } = useTheme().theme
  const styles = useStyles()
  const { LL } = useI18nContext()

  const flashcardLnurl = route.params.flashcardLnurl || ""

  const handleCopy = () => {
    Clipboard.setString(flashcardLnurl)
  }

  const handleShare = async () => {
    await Share.share({ message: flashcardLnurl })
  }

  return (
    <>
      <Screen
        preset="scroll"
        keyboardOffset="navigationHeader"
        keyboardShouldPersistTaps="handled"
        style={styles.screenStyle}
      >
        <QRView
          type={Invoice.PayCode}
          getFullUri={flashcardLnurl}
          loading={false}
          completed={false}
          err={""}
          style={styles.qrView}
          expired={false}
          copyToClipboard={handleCopy}
          isPayCode={true}
          canUsePayCode={true}
          toggleIsSetLightningAddressModalVisible={() => {}}
        />

        <View style={styles.extraDetails}>
          <TouchableOpacity onPress={handleCopy}>
            <Text {...testProps("readable-payment-request")}>
              {`${flashcardLnurl.slice(0, 15)}...${flashcardLnurl.slice(-15)}`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareInvoice}>
            <Icon color={colors.grey2} name="share-outline" size={30} />
          </TouchableOpacity>
        </View>

        <View style={styles.extraDetails}>
          <Text style={styles.instructions}>
            {LL.ReceiveScreen.flashcardInstructions()}
          </Text>
        </View>
      </Screen>
    </>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  qrView: {
    marginBottom: 10,
  },
  extraDetails: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  shareInvoice: {
    marginLeft: 5,
  },
  instructions: {
    fontSize: 28,
    color: colors.green,
    marginBottom: 10,
    textAlign: "center",
  },
}))
