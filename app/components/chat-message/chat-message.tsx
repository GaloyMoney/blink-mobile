import React, { useEffect } from "react"
import { View, Text } from "react-native"
import { makeStyles } from "@rneui/themed"
import crypto from "react-native-quick-crypto"
import * as secp from "@noble/secp256k1"
import NDK, { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk"
import { MessageType } from "@flyerhq/react-native-chat-ui"

type Props = {
  sender: string
  seckey: string
  recipient: string[0][1]
  message: MessageType.Text
  nextMessage: number
  prevMessage: boolean
}

export const ChatMessage: React.FC<Props> = ({ sender, seckey, recipient, message }) => {
  const styles = useStyles()
  /* -------------DEBUGGING----------------- */
  console.log("message: ", message.text)
  console.log("sender: ", sender)
  console.log("seckey: ", seckey)
  console.log("recipient: ", recipient)
  /* -------------DEBUGGING----------------- */

  useEffect(() => {
    const publishEvent = async () => {
      // Connect to nostr
      const ndk = new NDK({
        explicitRelayUrls: [
          "wss://nostr.pleb.network",
          "wss://relay.damuas.io",
          "wss://purplepag.es",
          "wss://relay.n057r.club",
          "wss://nostr-pub.wellorder.net",
        ],
      })

      const sharedPoint = secp.getSharedSecret(seckey, "02" + recipient)

      /* -------------DEBUGGING----------------- */
      console.log("sharedPoint: ", sharedPoint)

      /* -------------DEBUGGING----------------- */

      const sharedX = sharedPoint.slice(1, 33)
      const iv = crypto.randomFillSync(new Uint8Array(16))
      const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(sharedX), iv)
      let encryptedMessage = cipher.update(message.text, "utf8", "base64")
      encryptedMessage += cipher.final("base64")
      const ivBase64 = Buffer.from(iv.buffer).toString("base64")
      const signer = new NDKPrivateKeySigner(seckey)

      /* -------------DEBUGGING----------------- */
      console.log("signer created")

      /* -------------DEBUGGING----------------- */

      // Create a new event
      const event = {
        pubkey: sender,
        // eslint-disable-next-line camelcase
        created_at: Math.floor(Date.now() / 1000),
        kind: 4,
        tags: [["p", recipient]],
        content: encryptedMessage + "?iv=" + ivBase64,
      }

      /* -------------DEBUGGING----------------- */
      console.log("event created")

      /* -------------DEBUGGING----------------- */

      // Sign the event
      const signature = await signer.sign(event)

      /* -------------DEBUGGING----------------- */
      console.log("event signed")

      /* -------------DEBUGGING----------------- */

      // Create a new event
      const ndkEvent = new NDKEvent(ndk)
      ndkEvent.pubkey = event.pubkey
      // eslint-disable-next-line camelcase
      ndkEvent.created_at = event.created_at
      ndkEvent.tags = event.tags
      ndkEvent.content = event.content
      ndkEvent.kind = event.kind
      ndkEvent.sig = signature

      // Publish the event
      await ndk.publish(ndkEvent)
      console.log("Event published!")
    }

    // Call the function to publish the event when the component mounts
    publishEvent()
  }, [message, sender, seckey, recipient])

  return (
    <View style={styles.container}>
      <Text style={styles.content}>{message.text}</Text>
      <Text style={styles.content}>{sender}</Text>
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
