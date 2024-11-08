import React, { useCallback, useEffect, useState } from "react"
import { Pressable, View } from "react-native"
import Modal from "react-native-modal"
import nfcManager, { Ndef, NfcTech } from "react-native-nfc-manager"
import { SafeAreaView } from "react-native-safe-area-context"
import Icon from "react-native-vector-icons/Ionicons"
import axios from "axios"
import { useI18nContext } from "@app/i18n/i18n-react"
import { isIOS } from "@rneui/base"
import { Text, makeStyles, useTheme } from "@rneui/themed"

// components
import { GaloySecondaryButton } from "../atomic/galoy-secondary-button"

// utils
import { toastShow } from "@app/utils/toast"

type Props = {
  isActive: boolean
  setIsActive: (arg: boolean) => void
  onCardHtmlUpdate: (html: string) => void
  setTagId: (tag: string) => void
}

export const ModalNfcFlashcard: React.FC<Props> = ({
  isActive,
  setIsActive,
  onCardHtmlUpdate,
  setTagId,
}) => {
  const styles = useStyles()
  const { colors } = useTheme().theme
  const { LL } = useI18nContext()

  useEffect(() => {
    if (isActive) {
      readNfc()
    }

    return () => {
      nfcManager.cancelTechnologyRequest()
      nfcManager.unregisterTagEvent()
    }
  }, [isActive])

  const readNfc = async () => {
    try {
      const isSupported = await nfcManager.isSupported()
      if (!isSupported) {
        showToastMessage(LL.CardScreen.notSupported())
      } else {
        await nfcManager.start()
        await nfcManager.requestTechnology(NfcTech.Ndef)
        const tag = await nfcManager.getTag()

        if (tag && tag.id) {
          setTagId(tag.id)
          const ndefRecord = tag?.ndefMessage?.[0]
          if (!ndefRecord) {
            showToastMessage(LL.CardScreen.noNDEFMessage())
          } else {
            const payload = Ndef.text.decodePayload(new Uint8Array(ndefRecord.payload))
            if (payload.startsWith("lnurlw")) {
              await handleSubmit(payload)
              await nfcManager.cancelTechnologyRequest()
            }
          }
        } else {
          showToastMessage(LL.CardScreen.noTag())
        }
      }
    } catch (error: any) {
      showToastMessage(LL.CardScreen.notFlashcard())
    }
  }

  const dismiss = useCallback(async () => {
    setIsActive(false)
    try {
      await nfcManager.cancelTechnologyRequest()
      await nfcManager.unregisterTagEvent()
    } catch (error) {
      console.warn("Error while canceling NFC technology request", error)
    }
  }, [setIsActive])

  const handleSubmit = useCallback(
    async (payload: string) => {
      try {
        const payloadPart = payload.split("?")[1]
        const domain = payload.split("/")[2] // Extract the domain from the payload

        const url = `https://${domain}/boltcards/balance?${payloadPart}`

        const response = await axios.get(url)
        onCardHtmlUpdate(response.data)
        await dismiss()
      } catch (error) {
        showToastMessage(LL.CardScreen.notFlashcard())
      }
    },
    [dismiss, onCardHtmlUpdate],
  )

  const showToastMessage = async (message: string) => {
    await dismiss()
    toastShow({
      message,
      type: "error",
      position: "top",
    })
  }

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
