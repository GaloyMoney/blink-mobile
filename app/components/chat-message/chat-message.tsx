/* eslint-disable react-hooks/exhaustive-deps */
import "react-native-get-random-values"
import aesCrypto from "react-native-aes-crypto"
import { generateSecureRandom } from "react-native-securerandom"
import React, { useEffect, useCallback, useRef } from "react"
import { View, Text } from "react-native"
import { makeStyles } from "@rneui/themed"
// import base64 from "react-native-base64"
import NDK, { NDKEvent, NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk"
import { MessageType } from "@flyerhq/react-native-chat-ui"
import * as secp from "@noble/secp256k1"
import { MyCryptoKey } from "@app/types/crypto"
// eslint-disable-next-line import/no-extraneous-dependencies
// import { nip19 } from "nostr-tools"

type Props = {
  sender: NDKUser | undefined
  seckey: MyCryptoKey | undefined
  recipient: NDKUser | undefined
  message: MessageType.Text
  nextMessage: number
  prevMessage: boolean
}

type secureSender = {
  seckey: string | undefined
  pubkey: string | undefined
}

export const ChatMessage: React.FC<Props> = ({ sender, seckey, recipient, message }) => {
  const styles = useStyles()
  const isMounted = useRef(false)
  const publishEvent = useCallback(
    async (sender: secureSender, recipient: string, text: string) => {
      if (!isMounted.current) return
      try {
        // Connect to nostr
        const ndk = new NDK({
          explicitRelayUrls: [
            "wss://nos.lol",
            "wss://no.str.cr",
            "wss://purplepag.es",
            "wss://nostr.mom",
            "wss://nostr.pleb.network",
          ],
        })
        const MAX_RETRIES = 10
        let retryCount = 0
        const connectToNostr = async () => {
          try {
            await ndk.connect()
            const signer = new NDKPrivateKeySigner(sender.seckey || "")
            if (sender.seckey && recipient) {
              const sharedPoint = secp.getSharedSecret(
                sender.seckey || "",
                "02" + recipient,
              )
              const sharedX = sharedPoint.slice(1, 33)
              const iv = await generateSecureRandom(16)
              const ivBase64 = Buffer.from(iv).toString("base64")
              const key = Buffer.from(sharedX).toString("base64")
              const algo = "aes-256-cbc"
              const encryptedMessage = await aesCrypto.encrypt(text, key, ivBase64, algo)
              const ndkEvent = new NDKEvent(ndk)
              // eslint-disable-next-line camelcase
              ndkEvent.created_at = Math.floor(Date.now() / 1000)
              ndkEvent.pubkey = sender.pubkey || ""
              ndkEvent.tags = [["p", recipient || ""]]
              ndkEvent.kind = 4
              ndkEvent.content = encryptedMessage + "?iv=" + ivBase64
              await ndkEvent.sign(signer)
              // Publish the event
              await ndk.publish(ndkEvent)
              console.log("Event published!")
            } else {
              console.log("Waiting for senderKey and recipient to be set...")
              throw new Error("senderKey and recipient are not set")
            }
          } catch (error) {
            console.log("Error connecting to NOSTR ", error)
            if (retryCount < MAX_RETRIES) {
              retryCount += 1
              console.log(`Retry attempt ${retryCount}...`)
              await connectToNostr()
            }
          }
        }
        await connectToNostr()
      } catch (error) {
        console.log("Error during event publishing: ", error)
      }
    },
    [],
  )

  useEffect(() => {
    isMounted.current = true
    if (message.text && seckey?.key && recipient?.hexpubkey() && sender?.hexpubkey()) {
      const senderSec: secureSender = { seckey: seckey?.key, pubkey: sender?.hexpubkey() }
      console.log("Publishing event...")
      publishEvent(senderSec, recipient?.hexpubkey(), message.text)
    } else {
      console.log("Waiting for event to load...")
    }
    return () => {
      isMounted.current = false
    }
  }, [message.text, seckey?.key, recipient?.hexpubkey(), sender?.hexpubkey()])

  return (
    <View style={styles.container}>
      <Text style={styles.content}>{message.text}</Text>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    backgroundColor: colors.grey5,
    borderColor: colors.grey4,
    borderWidth: 1,
    borderRadius: 12,
    padding: 9,
    overflow: "hidden",
  },
  content: {
    color: colors.grey1,
  },
}))
