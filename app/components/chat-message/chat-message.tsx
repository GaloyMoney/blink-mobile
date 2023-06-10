import "react-native-get-random-values"
import React, { useEffect } from "react"
import { View, Text } from "react-native"
import { makeStyles } from "@rneui/themed"
import NDK, { NDKEvent, NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk"
import { MessageType } from "@flyerhq/react-native-chat-ui"

type Props = {
  sender: NDKUser
  seckey: string | undefined
  recipient: NDKUser
  message: MessageType.Text
  nextMessage: number
  prevMessage: boolean
}

export const ChatMessage: React.FC<Props> = ({ sender, seckey, recipient, message }) => {
  const styles = useStyles()

  /* -------------DEBUGGING----------------- */
  console.log("message: ", message.text)
  console.log("seckey: ", seckey || "no seckey")
  console.log("sender npub: ", sender?.npub || "no sender")
  console.log("sender hexpubkey ", sender?.hexpubkey() || "no sender")
  console.log("recipient npub: ", recipient?.npub || "no recipient")
  console.log("recipient hexpubkey ", recipient?.hexpubkey() || "no recipient")
  /* -------------DEBUGGING----------------- */

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
            "wss://nostr.pleb.network",
            "wss://relay.damuas.io",
            "wss://purplepag.es",
            "wss://relay.n057r.club",
            "wss://nostr-pub.wellorder.net",
          ],
        })
        await recipient.fetchProfile()
        await sender.fetchProfile()
        if (isMounted) {
          setRecipientProfile(recipient)
          setSenderProfile(sender)
          setSenderNsec(seckey || "")
          setMessageText(message.text)
        }
        // Create a new signer from the @nostr-dev-kit/ndk package
        const signer = new NDKPrivateKeySigner(senderNsec)
        // Create a new event
        const ndkEvent = new NDKEvent(ndk)
        // eslint-disable-next-line camelcase
        ndkEvent.created_at = Math.floor(Date.now() / 1000)
        ndkEvent.pubkey = senderProfile?.hexpubkey() || ""
        ndkEvent.tags = [["p", recipientProfile?.hexpubkey() || ""]]
        ndkEvent.content = messageText
        ndkEvent.kind = 4
        // encrypt the event
        await ndkEvent.encrypt(recipient, signer)
        /* -------------DEBUGGING----------------- */
        console.log("ndkEvent encrypted")
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

    return () => {
      isMounted = false
    } // clean up function to set isMounted to false when unmounting
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
