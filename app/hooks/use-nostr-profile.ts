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
} from "nostr-tools"
import { MessageType } from "@flyerhq/react-native-chat-ui"

const useNostrProfile = () => {
  const KEYCHAIN_NOSTRCREDS_KEY = "nostr_creds_key"
  const [nostrSecretKey, setNostrSecretKey] = useState<string>("")
  const [nostrPublicKey, setNostrPublicKey] = useState<string>("")
  const relays = [
    "wss://relay.damus.io",
    "wss://relay.primal.net",
    "wss://nos.lol",
    "wss://purplerelay.com/",
    "wss://relay.snort.social/",
    "wss://nostr.bitcoiner.social/",
    "wss://nostr.oxtr.dev/",
    "wss://relay.mostr.pub/",
    "wss://purplerelay.com",
  ]

  const fetchSecretFromLocalStorage = async () => {
    let credentials = await Keychain.getInternetCredentials(KEYCHAIN_NOSTRCREDS_KEY)
    if (credentials) {
      setNostrSecretKey(credentials.password)
      return credentials.password
    }
    return false
  }

  useEffect(() => {
    const initializeNostrProfile = async () => {
      try {
        console.log("Looking for nostr creds in keychain")
        const credentials = await fetchSecretFromLocalStorage()
        if (credentials) return
        const nostrSecret = nip19.nsecEncode(generateSecretKey())
        await Keychain.setInternetCredentials(
          KEYCHAIN_NOSTRCREDS_KEY,
          KEYCHAIN_NOSTRCREDS_KEY,
          nostrSecret,
        )
        setNostrSecretKey(nostrSecret)
        await getPubkey()
        return nostrSecret
      } catch (error) {
        console.error("Error in generating nostr secret: ", error)
        throw error
      }
    }

    initializeNostrProfile()
  }, [])

  const fetchNostrUser = async (npub: `npub1${string}`) => {
    const pool = new SimplePool()
    const nostrProfile = await pool.get(relays, {
      kinds: [0],
      authors: [nip19.decode(npub).data],
    })
    pool.close(relays)
    if (!nostrProfile?.content) {
      return null
    }
    try {
      return {
        ...JSON.parse(nostrProfile.content),
        pubkey: nip19.npubEncode(nostrProfile.pubkey),
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

  async function encryptMessage(message: string, receiverPublicKey: string) {
    let privateKey = Buffer.from(
      nip19.decode(nostrSecretKey).data as Uint8Array,
    ).toString("hex")
    let ciphertext = await nip04.encrypt(privateKey, receiverPublicKey, message)
    return ciphertext
  }

  function signEvent(baseEvent: UnsignedEvent, userSecretKey: string) {
    const privateKey = nip19.decode(userSecretKey).data as Uint8Array
    const nostrEvent = finalizeEvent(baseEvent, privateKey)
    return nostrEvent
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

  const fetchMessagedEvents = async () => {
    let pubkey = nip19.decode(await getPubkey()).data as string
    let filter = {
      kinds: [4],
      authors: [pubkey],
    }
    const pool = new SimplePool()
    let messagedEvents = await pool.querySync(relays, filter)
    pool.close(relays)
    return messagedEvents
  }

  const fetchProfiles = async (pubkeys: string[]) => {
    let filter = {
      kinds: [0],
      authors: pubkeys,
    }
    const pool = new SimplePool()
    let profiles = await pool.querySync(relays, filter)
    pool.close(relays)
    return profiles
  }

  const retrieveMessagedUsers = async () => {
    const messagedEvents = await fetchMessagedEvents()
    let messagedUsers = new Set<string>()
    messagedEvents.forEach((event) => {
      messagedUsers.add(event.tags[0][1])
    })
    let profileEvents = await fetchProfiles(Array.from(messagedUsers))
    let seen = new Set()
    let profiles = profileEvents
      .filter((kind0) => {
        try {
          JSON.parse(kind0.content)
          return true
        } catch (e) {
          return false
        }
      })
      .map((kind0) => {
        return { ...JSON.parse(kind0.content), pubkey: nip19.npubEncode(kind0.pubkey) }
      })
      .filter((profile) => {
        if (!seen.has(profile.pubkey)) {
          seen.add(profile.pubkey)
          return true
        }
        return false
      })

    return profiles
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

  const subscribeToMessages = async (
    recipientId: string,
    callback: (message: MessageType.Text) => void,
  ) => {
    let recipient = nip19.decode(recipientId).data as string
    let userId = nip19.decode(await getPubkey()).data as string
    let filter = {
      "authors": [recipient, userId],
      "#p": [recipient, userId],
      "kinds": [4],
    }
    const pool = new SimplePool()
    let h = pool.subscribeMany(relays, [filter], {
      onevent: (event) => {
        decryptMessage(recipientId, event.content).then((message) => {
          callback({
            text: message,
            author: { id: nip19.npubEncode(event.pubkey) },
            id: event.id,
            type: "text",
            createdAt: event.created_at,
          })
        })
      },
      oneose: () => {
        console.log("closed!")
        h.close()
      },
    })
  }

  const fetchMessagesWith = async (recipientId: string) => {
    let userId = nip19.decode(await getPubkey()).data as string
    let recipient = nip19.decode(recipientId).data as string
    let filterSent = {
      "authors": [recipient, userId],
      "#p": [recipient, userId],
      "kinds": [4],
    }
    const pool = new SimplePool()
    let events = await pool.querySync(relays, filterSent)
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
    const pool = new SimplePool()
    let pubKey = nostrPublicKey
    if (!pubKey) {
      pubKey = nip19.decode(await getPubkey()).data as string
    }
    const kind0Event = {
      kind: 0,
      pubkey: pubKey,
      content: JSON.stringify(content),
      tags: [],
      created_at: Math.floor(Date.now() / 1000),
    }
    let privateKey = nostrSecretKey
    if (!privateKey) {
      privateKey = (await fetchSecretFromLocalStorage()) as string
      if (!privateKey) throw Error("No private key found")
    }
    let privateKeyHex = nip19.decode(privateKey).data as Uint8Array
    const signedKind0Event = finalizeEvent(kind0Event, privateKeyHex)
    await Promise.any(pool.publish(relays, signedKind0Event))
    pool.close(relays)
  }

  return {
    nostrSecretKey,
    nostrPubKey: nostrPublicKey,
    fetchNostrUser,
    sendMessage,
    retrieveMessagedUsers,
    fetchMessagesWith,
    updateNostrProfile,
    subscribeToMessages,
  }
}

export default useNostrProfile
