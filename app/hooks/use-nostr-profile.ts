import { useState, useEffect } from "react"
import * as Keychain from "react-native-keychain"
import {
  nip19,
  generateSecretKey,
  getPublicKey,
  SimplePool,
  nip04,
  UnsignedEvent,
  finalizeEvent,
  Event,
} from "nostr-tools"
import {
  createRumor,
  createSeal,
  createWrap,
  getRumorFromWrap,
  getSecretKey,
  setPreferredRelay,
} from "@app/utils/nostr"
import { useHomeAuthedQuery, useUserUpdateNpubMutation } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useAppConfig } from "./use-app-config"

export interface ChatInfo {
  pubkeys: string[]
  subject?: string
  id: string
}

export type MessageType = {
  id: string
  text: string
  author: { id: string }
  type: string
  createdAt: number
}

const useNostrProfile = () => {
  const KEYCHAIN_NOSTRCREDS_KEY = "nostr_creds_key"
  const [nostrSecretKey, setNostrSecretKey] = useState<string>("")
  const [nostrPublicKey, setNostrPublicKey] = useState<string>("")
  const {
    appConfig: {
      galoyInstance: { relayUrl },
    },
  } = useAppConfig()
  const isAuthed = useIsAuthed()

  const { data: dataAuthed } = useHomeAuthedQuery({
    skip: !isAuthed,
    fetchPolicy: "network-only",
    errorPolicy: "all",
    nextFetchPolicy: "cache-and-network", // this enables offline mode use-case
  })
  const relays = [relayUrl, "wss://relay.damus.io"]

  const [userUpdateNpubMutation] = useUserUpdateNpubMutation()

  const fetchSecretFromLocalStorage = async () => {
    let credentials = await Keychain.getInternetCredentials(KEYCHAIN_NOSTRCREDS_KEY)
    if (credentials) {
      setNostrSecretKey(credentials.password)
      return credentials.password
    }
    return false
  }

  async function encryptMessage(message: string, receiverPublicKey: string) {
    let privateKey = Buffer.from(
      nip19.decode(nostrSecretKey).data as Uint8Array,
    ).toString("hex")
    let ciphertext = await nip04.encrypt(privateKey, receiverPublicKey, message)
    return ciphertext
  }

  useEffect(() => {
    const initializeNostrProfile = async () => {
      try {
        const credentials = await fetchSecretFromLocalStorage()
        let accountNpub = dataAuthed?.me?.npub
        if (!credentials) {
          if (accountNpub) return
          let secret = generateSecretKey()
          const nostrSecret = nip19.nsecEncode(secret)
          await Keychain.setInternetCredentials(
            KEYCHAIN_NOSTRCREDS_KEY,
            KEYCHAIN_NOSTRCREDS_KEY,
            nostrSecret,
          )
          setNostrSecretKey(nostrSecret)
          await userUpdateNpubMutation({
            variables: {
              input: {
                npub: nip19.npubEncode(getPublicKey(secret)),
              },
            },
          })
          await setPreferredRelay(relayUrl, secret)
          return
        }
        if (credentials) {
          let secret = nip19.decode(credentials).data as Uint8Array
          if (isAuthed && dataAuthed?.me && !accountNpub) {
            console.log()
            await userUpdateNpubMutation({
              variables: {
                input: {
                  npub: nip19.npubEncode(getPublicKey(secret)),
                },
              },
            })
            await setPreferredRelay(relayUrl, secret)
          }
        }
      } catch (error) {
        console.error("Error in generating nostr secret: ", error)
        throw error
      }
    }

    initializeNostrProfile()
  }, [isAuthed])

  const fetchNostrUser = async (npub: `npub1${string}`) => {
    const pool = new SimplePool()
    const nostrProfile = await pool.get(relays, {
      kinds: [0],
      authors: [nip19.decode(npub).data],
    })
    pool.close(relays)
    if (!nostrProfile?.content) {
      return { pubkey: npub }
    }
    try {
      return {
        ...JSON.parse(nostrProfile.content),
        pubkey: nostrProfile.pubkey,
      }
    } catch (error) {
      console.error("Error parsing nostr profile: ", error)
      throw error
    }
  }

  const getPubkey = async () => {
    if (nostrPublicKey) return nostrPublicKey
    let privateKey = nostrSecretKey
    if (!privateKey) {
      let localKey = await fetchSecretFromLocalStorage()
      if (!localKey) {
        throw Error("No Nostr key present in the app")
      } else {
        privateKey = localKey
        setNostrSecretKey(privateKey)
      }
    }
    const pubKeyHex = getPublicKey(nip19.decode(privateKey).data as Uint8Array)
    let pubKey = nip19.npubEncode(pubKeyHex)
    setNostrPublicKey(pubKey)
    return pubKey
  }

  const sendMessage = async (recipientId: string, message: string) => {
    let recipient = nip19.decode(recipientId).data as string
    const ciphertext = await encryptMessage(message, recipient)
    const baseKind4Event = {
      kind: 4,
      pubkey: nip19.decode(await getPubkey()).data as string,
      tags: [["p", recipient]],
      content: ciphertext,
      created_at: Math.floor(Date.now() / 1000),
    }
    let privateKey = nip19.decode(nostrSecretKey).data as Uint8Array
    const kind4Event = finalizeEvent(baseKind4Event, privateKey)
    const pool = new SimplePool()
    await Promise.any(pool.publish(relays, kind4Event))
    pool.close(relays)
  }
  const retrieveMessagedUsers = (giftwraps: Event[]) => {
    if (!nostrSecretKey) return []
    let privateKey = nip19.decode(nostrSecretKey).data as Uint8Array
    let messagedUsers: Map<string, ChatInfo> = new Map()
    giftwraps.forEach((event) => {
      try {
        let rumor = getRumorFromWrap(event, privateKey)
        let chatPubkeys = rumor.tags
          .filter((t: string[]) => t[0] === "p")
          .map((t: string[]) => t[1])
        let subject = rumor.tags.find((t: string[]) => t[0] === "subject")?.[1]
        messagedUsers.set(chatPubkeys.join(","), {
          pubkeys: chatPubkeys,
          subject: subject,
          id: chatPubkeys.join(","),
        })
      } catch (e) {
        console.log("Error decrypting", e)
      }
    })
    return messagedUsers.values()
  }

  const decryptMessage = async (recipientId: string, encryptedMessage: string) => {
    let recipient = nip19.decode(recipientId).data as string
    let privateKey = nostrSecretKey
    if (!privateKey) {
      let localKey = await fetchSecretFromLocalStorage()
      if (localKey) privateKey = localKey
      else throw Error("Keys not present in storage")
    }
    let hexKey = nip19.decode(privateKey).data as Uint8Array
    return await nip04.decrypt(hexKey, recipient, encryptedMessage)
  }

  const fetchMessagesWith = async (recipientId: string) => {
    let userId = nip19.decode(await getPubkey()).data as string
    let recipient = nip19.decode(recipientId).data as string
    let filterSent = {
      "authors": [userId],
      "#p": [recipient],
      "kinds": [4],
    }
    let filterReceived = {
      "authors": [recipient],
      "#p": [userId],
      "kinds": [4],
    }
    const pool = new SimplePool()
    const sentEvents = await pool.querySync(relays, filterSent)
    const receivedEvents = await pool.querySync(relays, filterReceived)
    const events = [...sentEvents, ...receivedEvents]
    pool.close(relays)
    let messages = await Promise.all(
      events.map(async (event) => {
        let text = ""
        try {
          text = await decryptMessage(recipientId, event.content)
        } catch (e) {
          console.error("Error decrypting message: ", e)
        }
        return {
          text: text,
          author: { id: nip19.npubEncode(event.pubkey) },
          id: event.id,
          type: "text",
          createdAt: event.created_at,
        }
      }),
    )
    messages.sort((a, b) => b.createdAt - a.createdAt)
    return messages
  }

  const updateNostrProfile = async ({
    content,
  }: {
    content: {
      name?: string
      username?: string
      nip05?: string
      flash_username?: string
      lud16?: string
    }
  }) => {
    console.log("inside update Nostr Profile")
    const pool = new SimplePool()
    let publicRelays = [
      ...relays,
      "wss://relay.damus.io",
      "wss://relay.primal.net",
      "wss://nos.lol",
    ]
    let secret = await getSecretKey()
    if (!secret) {
      throw Error("Nostr secret not set")
    }
    let pubKey = getPublicKey(secret)
    const kind0Event = {
      kind: 0,
      pubkey: pubKey,
      content: JSON.stringify(content),
      tags: [],
      created_at: Math.floor(Date.now() / 1000),
    }
    const signedKind0Event = finalizeEvent(kind0Event, secret)
    let messages = await Promise.any(pool.publish(publicRelays, signedKind0Event))
    console.log("Profile event published", messages)
    pool.close(publicRelays)
  }

  const fetchNostrPubKey = async () => {
    return nip19.decode(await getPubkey()).data as string
  }

  return {
    nostrSecretKey,
    nostrPubKey: nostrPublicKey,
    fetchNostrUser,
    sendMessage,
    retrieveMessagedUsers,
    fetchMessagesWith,
    updateNostrProfile,
    fetchNostrPubKey,
  }
}

export default useNostrProfile
