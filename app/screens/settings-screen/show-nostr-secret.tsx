import useNostrProfile from "@app/hooks/use-nostr-profile"
import ReactNativeModal from "react-native-modal"
import Clipboard from "@react-native-clipboard/clipboard"
import { View, ViewStyle } from "react-native"
import { Text, useTheme } from "@rneui/themed"
import { useState } from "react"
import { getPublicKey, nip19 } from "nostr-tools"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"

interface ShowNostrSecretProps {
  isActive: boolean
  onCancel: () => void
}

export const ShowNostrSecret: React.FC<ShowNostrSecretProps> = ({
  isActive,
  onCancel,
}) => {
  const { nostrSecretKey } = useNostrProfile()
  let nostrPubKey = ""
  if (nostrSecretKey) {
    const { type, data } = nip19.decode(nostrSecretKey)
    nostrPubKey = nip19.npubEncode(getPublicKey(data as Uint8Array))
  }
  const {
    theme: { colors },
  } = useTheme()
  const [copiedNsec, setCopiedNsec] = useState(false)
  const [copiedNpub, setCopiedNpub] = useState(false)
  const [hideSecret, setHideSecret] = useState(true)
  const styles = {
    modalStyle: {},
    modalBody: {
      backgroundColor: colors.white,
      justifyContent: "flex-start",
      flexDirection: "column",
      alignItems: "flex-start",
      padding: 20,
      borderRadius: 20,
    },
    idContainer: {
      backgroundColor: colors.grey5,
      borderRadius: 5,
      padding: 10,
      margin: 10,
    },
  }

  const copyToClipboard = (copyText: string, handler: (copied: boolean) => void) => {
    Clipboard.setString(copyText)
    handler(true)
    setTimeout(() => {
      handler(false)
    }, 1000)
  }

  return (
    <ReactNativeModal
      isVisible={isActive}
      backdropColor={colors.grey5}
      backdropOpacity={0.7}
      onBackButtonPress={onCancel}
      onBackdropPress={onCancel}
      style={styles.modalStyle}
    >
      <View style={styles.modalBody as ViewStyle}>
        <Text type="h2">Your nostr address is</Text>
        <View
          style={styles.idContainer as ViewStyle}
          onTouchStart={() => copyToClipboard(nostrPubKey, setCopiedNpub)}
        >
          <Text onPress={() => copyToClipboard(nostrPubKey, setCopiedNpub)}>
            {nostrPubKey} {"\n"}
          </Text>
          <GaloyIconButton
            name={copiedNpub ? "check" : "copy-paste"}
            size={"small"}
            onPress={() => copyToClipboard(nostrPubKey, setCopiedNpub)}
          />
        </View>

        <Text type="h2">Your nostr secret is</Text>
        <View style={styles.idContainer as ViewStyle}>
          <Text onPress={() => copyToClipboard(nostrSecretKey, setCopiedNsec)}>
            {hideSecret
              ? "************************************************************************"
              : nostrSecretKey}{" "}
            {"\n"}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <GaloyIconButton
              name={hideSecret ? "eye" : "eye-slash"}
              size={"small"}
              onPress={() => setHideSecret(!hideSecret)}
              style={{ marginRight: 10 }}
            />
            <GaloyIconButton
              name={copiedNsec ? "check" : "copy-paste"}
              size={"small"}
              onPress={() => copyToClipboard(nostrSecretKey, setCopiedNsec)}
            />
          </View>
        </View>
      </View>
    </ReactNativeModal>
  )
}
