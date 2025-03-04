import ReactNativeModal from "react-native-modal"
import Clipboard from "@react-native-clipboard/clipboard"
import { View, ViewStyle } from "react-native"
import { Text, useTheme } from "@rneui/themed"
import { useEffect, useState } from "react"
import { getPublicKey, nip19 } from "nostr-tools"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { getSecretKey } from "@app/utils/nostr"
import { Button } from "@rneui/themed"
import useNostrProfile from "@app/hooks/use-nostr-profile"

interface ShowNostrSecretProps {
  isActive: boolean
  onCancel: () => void
}

export const ShowNostrSecret: React.FC<ShowNostrSecretProps> = ({
  isActive,
  onCancel,
}) => {
  const [secretKey, setSecretKey] = useState<Uint8Array | null>(null)

  useEffect(() => {
    const initialize = async () => {
      console.log("Show Nostr Secret initializing with", secretKey)
      if (!secretKey) {
        let secret = await getSecretKey()
        setSecretKey(secret)
        console.log("New secret Key", secret)
      }
    }
    initialize()
  }, [secretKey])
  const { saveNewNostrKey, deleteNostrKeys } = useNostrProfile()
  let nostrPubKey = ""
  if (secretKey) {
    nostrPubKey = nip19.npubEncode(getPublicKey(secretKey as Uint8Array))
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
      {!!secretKey ? (
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
            <Text
              onPress={() => copyToClipboard(nip19.nsecEncode(secretKey), setCopiedNsec)}
            >
              {hideSecret
                ? "************************************************************************"
                : secretKey}{" "}
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
                onPress={() =>
                  copyToClipboard(nip19.nsecEncode(secretKey), setCopiedNsec)
                }
              />
            </View>
          </View>
          <Button
            onPress={() => {
              deleteNostrKeys()
              setSecretKey(null)
            }}
          >
            Delete
          </Button>
        </View>
      ) : (
        <View style={styles.modalBody as ViewStyle}>
          <Text style={{ margin: 20 }}> No Nostr Keys Found </Text>
          <Button
            onPress={async () => {
              let newSecret = await saveNewNostrKey()
              console.log("New Nostr Key", newSecret)
              setSecretKey(newSecret)
            }}
            style={{ margin: 20 }}
          >
            Generate Nostr Keys
          </Button>
        </View>
      )}
    </ReactNativeModal>
  )
}
