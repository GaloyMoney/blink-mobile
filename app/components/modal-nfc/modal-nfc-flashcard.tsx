import * as React from "react"
import { Alert, Pressable, View } from "react-native"
import Modal from "react-native-modal"
import NfcManager, { Ndef, NfcTech } from "react-native-nfc-manager"
import { SafeAreaView } from "react-native-safe-area-context"
import Icon from "react-native-vector-icons/Ionicons"
import axios from "axios"

import { useI18nContext } from "@app/i18n/i18n-react"
import { isIOS } from "@rneui/base"
import { Text, makeStyles, useTheme } from "@rneui/themed"

import { GaloySecondaryButton } from "../atomic/galoy-secondary-button"

export const ModalNfcFlashcard: React.FC<{
  isActive: boolean
  setIsActive: (arg: boolean) => void
  onCardHtmlUpdate: (html: string) => void
  tagId: (tag: string) => void
}> = ({ isActive, setIsActive, onCardHtmlUpdate, tagId }) => {
  const [nfcError, setNfcError] = React.useState<boolean>(false) // Added state to track NFC errors
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const { LL } = useI18nContext()
  const [nfcRegistered, setNfcRegistered] = React.useState<boolean>(false)

  const dismiss = React.useCallback(async () => {
    setIsActive(false)
    if (nfcRegistered) {
      try {
        await NfcManager.cancelTechnologyRequest()
        await NfcManager.unregisterTagEvent()
        setNfcRegistered(false)
      } catch (error) {
        console.warn("Error while canceling NFC technology request", error)
      }
    }
  }, [setIsActive, nfcRegistered])

  const handleSubmit = React.useCallback(
    async (payload: string) => {
      try {
        const payloadPart = payload.split("?")[1]
        const domain = payload.split("/")[2] // Extract the domain from the payload

        const url = `https://${domain}/boltcards/balance?${payloadPart}`

        const response = await axios.get(url)
        onCardHtmlUpdate(response.data)
        await dismiss()
      } catch (error) {
        Alert.alert("Failed to send data")
        console.error("HTTP Error", error)
      }
    },
    [dismiss, onCardHtmlUpdate],
  )

  React.useEffect(() => {
    const readNfc = async () => {
      try {
        const isSupported = await NfcManager.isSupported()

        if (!isSupported) {
          Alert.alert("NFC not supported on this device")
          dismiss()
          return
        }

        await NfcManager.start()
        console.log("NFC is enabled")
        await NfcManager.requestTechnology(NfcTech.Ndef)

        const tag = await NfcManager.getTag()
        if (tag && tag.id) {
          tagId(tag.id)
        } else {
          console.log("No tag found")
        }
        const ndefRecord = tag?.ndefMessage?.[0]

        if (!ndefRecord) {
          Alert.alert("No NDEF message found")
          setNfcError(true) // Set error state if no NDEF message is found
          dismiss()
          return
        }

        const payload = Ndef.text.decodePayload(new Uint8Array(ndefRecord.payload))
        setNfcError(false) // Clear error state if successful

        // Close the modal if the payload starts with "lnurlw"
        if (payload.startsWith("lnurlw")) {
          await handleSubmit(payload)
          await NfcManager.cancelTechnologyRequest()
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.message !== "Not even registered") {
          setNfcError(true)
        }
        // console.error("NFC Error", error)
        dismiss()
      }
    }

    if (isActive) {
      readNfc()
    }

    return () => {
      if (nfcRegistered) {
        NfcManager.cancelTechnologyRequest()
        NfcManager.unregisterTagEvent()
        setNfcRegistered(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, dismiss, nfcRegistered])

  return (
    <Modal
      swipeDirection={["down"]}
      isVisible={isActive && !isIOS}
      onSwipeComplete={dismiss}
      onBackdropPress={dismiss}
      backdropOpacity={0.3}
      backdropColor={colors.grey3}
      swipeThreshold={50}
      propagateSwipe
      style={styles.modal}
      onModalHide={() => {
        if (nfcError) {
          Alert.alert("Failed to read NFC tag") // Show alert only if there was an NFC error
        }
      }}
    >
      <Pressable style={styles.flex} onPress={dismiss}></Pressable>
      <SafeAreaView style={styles.modalForeground}>
        <View style={styles.iconContainer}>
          <Icon name="remove" size={72} color={colors.grey3} style={styles.icon} />
        </View>
        <Text type="h1" bold style={styles.message}>
          {LL.SettingsScreen.nfcScanNow()}
        </Text>
        <View style={styles.scanIconContainer}>
          <Icon name="scan" size={140} color={colors.grey1} />
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
