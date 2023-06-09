import React, { useEffect } from "react"
import { View, Text } from "react-native"
import { makeStyles } from "@rneui/themed"
// import crypto from "react-native-quick-crypto"
// import * as secp from "@noble/secp256k1"
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

      const signer = new NDKPrivateKeySigner(seckey)
      /* -------------DEBUGGING----------------- */
      console.log("ndkSigner created")
      /* -------------DEBUGGING----------------- */

      const ndkRecipient = ndk.getUser({ npub: recipient })
      /* -------------DEBUGGING----------------- */
      console.log("ndkRecipient created: ", ndkRecipient)
      /* -------------DEBUGGING----------------- */

      // const sharedPoint = secp.getSharedSecret(seckey, "02" + recipient)
      // const sharedX = sharedPoint.slice(1, 33)
      // const iv = crypto.randomFillSync(new Uint8Array(16))
      // const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(sharedX), iv)
      // let encryptedMessage = cipher.update(message.text, "utf8", "base64")
      // encryptedMessage += cipher.final("base64")
      // const ivBase64 = Buffer.from(iv.buffer).toString("base64")
      /* -------------DEBUGGING----------------- */
      // console.log("message finalized")
      // console.log("ivBase64: ", ivBase64)
      /* -------------DEBUGGING----------------- */

      // Create a new event
      // const event = {
      //   pubkey: sender,
      //   // eslint-disable-next-line camelcase
      //   created_at: Math.floor(Date.now() / 1000),
      //   kind: 4,
      //   tags: [["p", recipient]],
      //   content: message.text,
      // }
      /* -------------DEBUGGING----------------- */
      // console.log("event created")
      /* -------------DEBUGGING----------------- */

      // Create a new event
      const ndkEvent = new NDKEvent(ndk)
      ndkEvent.pubkey = sender
      // eslint-disable-next-line camelcase
      ndkEvent.created_at = Math.floor(Date.now() / 1000)
      ndkEvent.tags = [["p", recipient]]
      ndkEvent.content = message.text
      ndkEvent.kind = 4
      /* -------------DEBUGGING----------------- */
      console.log("ndkEvent created ")
      /* -------------DEBUGGING----------------- */

      const encryptedEvent = ndkEvent.encrypt(ndkRecipient, signer)
      /* -------------DEBUGGING----------------- */
      console.log("ndkEvent encrypted ")
      /* -------------DEBUGGING----------------- */

      // Sign the event
      const signedEvent = ndkEvent.sign(signer)
      /* -------------DEBUGGING----------------- */
      console.log("ndkEvent signed ")
      /* -------------DEBUGGING----------------- */

      // Publish the event
      await ndk.publish(ndkEvent)
      console.log("ndkEvent published! ")
    }

    // Call the function to publish the event when the component mounts
    publishEvent()
  }, [message, sender, seckey, recipient])

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
