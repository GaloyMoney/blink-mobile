import { useI18nContext } from "@app/i18n/i18n-react"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import * as React from "react"
import { Alert, Pressable, View } from "react-native"
import Modal from "react-native-modal"
import NfcManager, { Ndef, NdefRecord, NfcTech } from "react-native-nfc-manager"
import { SafeAreaView } from "react-native-safe-area-context"
import Icon from "react-native-vector-icons/Ionicons"
import { GaloySecondaryButton } from "../atomic/galoy-secondary-button"
import { parseDestination } from "@app/screens/send-bitcoin-screen/payment-destination"
import { logParseDestinationResult } from "@app/utils/analytics"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { DestinationDirection } from "@app/screens/send-bitcoin-screen/payment-destination/index.types"
import {
  useAccountDefaultWalletLazyQuery,
  useScanningQrCodeScreenQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { LNURL_DOMAINS } from "@app/config"

export const ModalNfc: React.FC<{
  isVisible: boolean
  setIsVisible: (arg: boolean) => void
}> = ({ isVisible, setIsVisible }) => {
  const { data } = useScanningQrCodeScreenQuery({ skip: !useIsAuthed() })
  const wallets = data?.me?.defaultAccount.wallets
  const bitcoinNetwork = data?.globals?.network

  const [accountDefaultWalletQuery] = useAccountDefaultWalletLazyQuery({
    fetchPolicy: "no-cache",
  })

  // FIXME: navigation destination?
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinDestination">>()

  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const { LL } = useI18nContext()

  React.useEffect(() => {
    if (!LL || !wallets || !bitcoinNetwork || !isVisible) {
      return
    }

    const init = async () => {
      console.log("starting scanNFCTag")
      NfcManager.start()

      let result: NdefRecord | undefined
      let lnurl: string

      try {
        // TODO: menu should only appear if this is a supported feature?
        if (!NfcManager.isSupported()) {
          Alert.alert("UnsupportedFeature")
        }

        await NfcManager.requestTechnology(NfcTech.Ndef)

        const tag = await NfcManager.getTag()

        result = tag?.ndefMessage?.find((record) => {
          const payload = record.payload
          const payloadString = Ndef.text.decodePayload(new Uint8Array(payload))
          console.log("decodedPayloadString: " + payloadString)

          if (
            payloadString.indexOf("lnurl") !== -1 ||
            payloadString.indexOf("LNURL") !== -1
          ) {
            return record
          }

          return false
        })

        if (!result) {
          return
        }

        lnurl = Ndef.text.decodePayload(new Uint8Array(result.payload))
      } catch (error) {
        // TODO: error that show as an Alert or onscreen message
        // but only when it's not user initiated
        // currently error returned is empty
        console.error({ error }, `can't fetch the Ndef payload`)
        return
      } finally {
        NfcManager.cancelTechnologyRequest()
      }

      // TODO: add a loading icon because this call do a fetch() to an external server
      // and the response can be arbitrary long

      const destination = await parseDestination({
        rawInput: lnurl,
        myWalletIds: wallets.map((wallet) => wallet.id),
        bitcoinNetwork,
        lnurlDomains: LNURL_DOMAINS,
        accountDefaultWalletQuery,
      })
      logParseDestinationResult(destination)

      if (destination.valid) {
        if (destination.destinationDirection === DestinationDirection.Send) {
          Alert.alert(LL.SettingsScreen.nfcOnlyReceive())
        }

        return navigation.reset({
          routes: [
            {
              name: "Primary",
            },
            {
              name: "redeemBitcoinDetail",
              params: {
                receiveDestination: destination,
              },
            },
          ],
        })
      }
    }

    init()
  }, [LL, wallets, bitcoinNetwork, accountDefaultWalletQuery, navigation, isVisible])

  const dismiss = async () => {
    setIsVisible(false)
    NfcManager.cancelTechnologyRequest()
  }

  return (
    <Modal
      swipeDirection={["down"]}
      isVisible={isVisible}
      onSwipeComplete={dismiss}
      onBackdropPress={dismiss}
      backdropOpacity={0.3}
      backdropColor={colors.grey3}
      swipeThreshold={50}
      propagateSwipe
      style={styles.modal}
    >
      <Pressable style={styles.flex} onPress={dismiss}></Pressable>
      <SafeAreaView style={styles.modalForeground}>
        <View style={styles.iconContainer}>
          <Icon name="ios-remove" size={72} color={colors.grey3} style={styles.icon} />
        </View>
        <Text type="h1" bold style={styles.message}>
          {LL.SettingsScreen.nfcScanNow()}
        </Text>
        <View style={styles.scanIconContainer}>
          <Icon name="ios-scan" size={140} color={colors.grey1} />
        </View>
        <View style={styles.buttonContainer}>
          <GaloySecondaryButton title={LL.common.cancel()} onPress={dismiss} />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  flex: {
    maxHeight: "25%",
    flex: 1,
  },

  buttonContainer: {
    marginBottom: 32,
  },

  icon: {
    height: 40,
    top: -40,
  },

  iconContainer: {
    height: 14,
  },

  scanIconContainer: {
    height: 40,
    flex: 1,
  },

  message: {
    marginVertical: 8,
  },

  modal: {
    margin: 0,
    flex: 3,
  },

  modalForeground: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    flex: 1,
    backgroundColor: colors.white,
  },

  modalContent: {
    backgroundColor: "white",
  },
}))
