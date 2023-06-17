/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
import "react-native-get-random-values"
import React, { useEffect, useCallback, useRef } from "react"
import { View, Text } from "react-native"
import { makeStyles } from "@rneui/themed"
import NDK, { NDKEvent, NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk"
import { MessageType } from "@flyerhq/react-native-chat-ui"
import { MyCryptoKey } from "@app/types/crypto"
import { encrypt, decrypt } from "@app/utils/crypto"
import { nip19 } from "nostr-tools"

type Props = {
  sender: NDKUser | undefined
  seckey: MyCryptoKey | undefined
  recipient: NDKUser | undefined
  message: MessageType.Text
  nextMessage: number
  prevMessage: boolean
}

type secureKeyPair = {
  seckey: string
  pubkey: string
}

let decryptedMessage: string

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

export const ChatMessage: React.FC<Props> = ({ sender, seckey, recipient, message }) => {
  const styles = useStyles()
  const isMounted = useRef(false)
  const publishEvent = useCallback(
    async (sender: secureKeyPair, recipient: secureKeyPair, text: string) => {
      if (!isMounted.current) return
      try {
        const MAX_RETRIES = 2
        let retryCount = 0
        const connectToNostr = async () => {
          try {
            await ndk.connect()
            const signer = new NDKPrivateKeySigner(sender.seckey || "")
            if (sender.seckey && recipient.pubkey) {
              const encryptedMessage = encrypt(sender.seckey, recipient.pubkey, text, 1)
              const ndkEvent = new NDKEvent(ndk)
              // eslint-disable-next-line camelcase
              ndkEvent.created_at = Math.floor(Date.now() / 1000)
              ndkEvent.pubkey = sender.pubkey || ""
              ndkEvent.tags = [["p", recipient.pubkey || ""]]
              ndkEvent.kind = 4
              ndkEvent.content = encryptedMessage
              await ndkEvent.sign(signer)
              // Publish the event
              await ndk.publish(ndkEvent).then(() => {
                console.log("Event published!")
                decryptedMessage = decrypt(
                  recipient.seckey || "",
                  sender.pubkey || "",
                  encryptedMessage,
                )
              })
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
    return () => {
      isMounted.current = false
    }
  }, [sender, recipient])

  const retrieveEvents = useCallback(
    async (sender: secureKeyPair, recipient: secureKeyPair) => {
      if (!isMounted.current) return
      const decodedSender = nip19.decode(
        "npub1u6c0pgwxmymtxac284n29wytuj27t5gjgag67e2784msgd0rrv8qhflash",
      )
      decodedSender.type = "npub"
      const decodedReceiver = nip19.decode(
        "npub1u6c0pgwxmymtxac284n29wytuj27t5gjgag67e2784msgd0rrv8qhflash",
      )
      decodedReceiver.type = "npub"

      try {
        // Connect to nostr
        await ndk.connect().then(async () => {
          ndk
            .fetchEvents({
              authors: [decodedSender.data.toString()],
              kinds: [4],
            })
            .then((events) => {
              console.log(
                "Events: ",
                events.forEach((event) => {
                  const message = decrypt(recipient.seckey, sender.pubkey, event.content)
                  console.log("Decrypted message: ", message)
                }),
              )
            })
        })
      } catch (error) {
        console.log("Error getting events: ", error)
      }
    },
    [],
  )

  useEffect(() => {
    isMounted.current = true
    if (message.text && seckey?.key && recipient?.hexpubkey() && sender?.hexpubkey()) {
      const senderSec: secureKeyPair = {
        seckey: seckey?.key,
        pubkey: sender?.hexpubkey(),
      }
      const recipientSec: secureKeyPair = {
        seckey: "39c34c3f2600a36d582cf9fca1bfffc102f0532d4c1ba74a2d1aa5afcb061c31",
        pubkey: "7ebc48d3e51a4d81719b7c1d601fd6f55b08e83d731e2eda27aacc543cbc1840",
      }
      // retrieveEvents(senderSec, recipientSec)
      console.log("Publishing event...")
      publishEvent(senderSec, recipientSec, message.text)
    } else {
      console.log("Waiting for event to load...")
    }
    return () => {
      isMounted.current = false
    }
  }, [message.text, seckey?.key, recipient?.hexpubkey(), sender?.hexpubkey()])

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.content}>{message.text}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.content}>Received Message: {decryptedMessage}</Text>
      </View>
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
