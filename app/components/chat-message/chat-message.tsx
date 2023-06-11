import "react-native-get-random-values"
import aesCrypto from "react-native-aes-crypto"
import { generateSecureRandom } from "react-native-securerandom"
import React, { useEffect } from "react"
import { View, Text } from "react-native"
import { makeStyles } from "@rneui/themed"
import NDK, { NDKEvent, NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk"
import { MessageType } from "@flyerhq/react-native-chat-ui"
import * as secp from "@noble/secp256k1"
// eslint-disable-next-line import/no-extraneous-dependencies
import { nip19 } from "nostr-tools"

type Props = {
  sender: NDKUser | undefined
  seckey: string | undefined
  recipient: NDKUser | undefined
  message: MessageType.Text
  nextMessage: number
  prevMessage: boolean
}

export const ChatMessage: React.FC<Props> = ({ sender, seckey, recipient, message }) => {
  const styles = useStyles()
  const [recipientProfile, setRecipientProfile] = React.useState<NDKUser>()
  const [senderProfile, setSenderProfile] = React.useState<NDKUser>()
  const [senderNsec, setSenderNsec] = React.useState<string>("")
  const [messageText, setMessageText] = React.useState<string>("")
  useEffect(() => {
    let isMounted = true
    const publishEvent = async () => {
      try {
        // Connect to nostr
        const ndk = new NDK({
          explicitRelayUrls: [
            "wss://nos.lol",
            "wss://no.str.cr",
            "wss://purplepag.es",
            "wss://nostr.mom",
          ],
        })
        ndk
          .connect()
          .then(() => {
            console.log("Connected to NOSTR")
          })
          .catch((error) => {
            console.log("Error connecting to NOSTR ", error)
          })
        await recipient?.fetchProfile()
        await sender?.fetchProfile()
        if (isMounted) {
          setRecipientProfile(recipient)
          setSenderProfile(sender)
          setSenderNsec(seckey || "")
          setMessageText(message.text)
        }
        const fetchMessages = () => {
          const decodedNpub = nip19.decode(senderProfile?.npub || "")
          const sub = ndk.subscribe({
            authors: [decodedNpub.data.toString()],
            kinds: [4],
          })
          console.log("subscribed to: ", decodedNpub.data.toString())
          sub.on("EVENT", (event) => {
            console.log("event received: ", event)
          })
          sub.on("EOSE", (EOSEvent) => {
            console.log("EOSE received: ", EOSEvent)
          })
          sub.on("NOTICE", (notice) => {
            console.log("Notice received: ", notice)
          })
        }
        // call the function to fetch messages
        fetchMessages()
        /* -------------DEBUGGING----------------- */
        console.log("message: ", messageText)
        console.log("seckey: ", senderNsec)
        console.log("sender npub: ", senderProfile?.npub || "no sender")
        console.log("sender hex ", senderProfile?.hexpubkey() || "no sender")
        console.log("recipient npub: ", recipientProfile?.npub || "no recipient")
        console.log("recipient hex", recipientProfile?.hexpubkey() || "no recipient")
        /* -------------DEBUGGING----------------- */
        // Create a new signer from the @nostr-dev-kit/ndk package
        const signer = new NDKPrivateKeySigner(senderNsec)
        // create encrypted message
        const sharedPoint = secp.getSharedSecret(
          senderNsec,
          "02" + recipientProfile?.hexpubkey(),
        )
        const sharedX = sharedPoint.slice(1, 33)
        const iv = await generateSecureRandom(16)
        const ivBase64 = Buffer.from(iv).toString("base64") // Convert the iv to base64
        const key = Buffer.from(sharedX).toString("base64") // Convert the sharedX to base64
        /* -------------DEBUGGING----------------- */
        console.log("ivBase64: ", ivBase64)
        /* -------------DEBUGGING----------------- */
        const algo = "aes-256-cbc"
        /* -------------DEBUGGING----------------- */
        console.log("encryption variables created")
        /* -------------DEBUGGING----------------- */
        const encryptedMessage = await aesCrypto.encrypt(messageText, key, ivBase64, algo)
        /* -------------DEBUGGING----------------- */
        console.log("message encrypted", encryptedMessage)
        /* -------------DEBUGGING----------------- */
        // Create a new event
        const ndkEvent = new NDKEvent(ndk)
        // eslint-disable-next-line camelcase
        ndkEvent.created_at = Math.floor(Date.now() / 1000)
        ndkEvent.pubkey = senderProfile?.hexpubkey() || ""
        ndkEvent.tags = [["p", recipientProfile?.hexpubkey() || ""]]
        ndkEvent.kind = 1
        ndkEvent.content = messageText
        /* -------------DEBUGGING----------------- */
        console.log("ndkEvent created")
        /* -------------DEBUGGING----------------- */
        // encrypt the event
        // await ndkEvent.encrypt(recipient, signer).catch((error) => {
        //   console.log("Error during event encryption: ", error)
        // })
        /* -------------DEBUGGING----------------- */
        // console.log("ndkEvent encrypted")
        /* -------------DEBUGGING----------------- */
        // Sign the event
        await ndkEvent.sign(signer)
        /* -------------DEBUGGING----------------- */
        console.log("ndkEvent signed")
        /* -------------DEBUGGING----------------- */
        // Publish the event
        await ndk.publish(ndkEvent).then(() => {
          console.log("ndkEvent published!")
        })
      } catch (error) {
        console.log("Error during event publishing: ", error)
      }
    }
    // Call the function to publish the event when the component mounts
    publishEvent()
    // clean up function to set isMounted to false when unmounting
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.text])

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
