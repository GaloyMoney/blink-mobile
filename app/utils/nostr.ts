import { useAppConfig } from "@app/hooks"
import { bytesToHex } from "@noble/curves/abstract/utils"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  UnsignedEvent,
  finalizeEvent,
  generateSecretKey,
  getEventHash,
  getPublicKey,
  Event,
  nip19,
  nip44,
  Relay,
  SimplePool,
  Filter,
  SubCloser,
  AbstractRelay,
} from "nostr-tools"
import { Alert } from "react-native"

import * as Keychain from "react-native-keychain"

let publicRelays = [
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://relay.snort.social",
  "wss//nos.lol",
]

const KEYCHAIN_NOSTRCREDS_KEY = "nostr_creds_key"

const now = () => Math.round(Date.now() / 1000)
export type Rumor = UnsignedEvent & { id: string }
export type Group = { subject: string; participants: string[] }

export const createRumor = (event: Partial<UnsignedEvent>, privateKey: Uint8Array) => {
  const rumor = {
    created_at: now(),
    content: "",
    tags: [],
    ...event,
    pubkey: getPublicKey(privateKey),
  } as any

  rumor.id = getEventHash(rumor)

  return rumor as Rumor
}

function encrypNip44Message(
  privateKey: Uint8Array,
  message: string,
  receiverPublicKey: string,
) {
  let conversationKey = nip44.v2.utils.getConversationKey(
    bytesToHex(privateKey),
    receiverPublicKey,
  )
  let ciphertext = nip44.v2.encrypt(message, conversationKey)
  return ciphertext
}

export const createSeal = (
  rumor: Rumor,
  privateKey: Uint8Array,
  recipientPublicKey: string,
) => {
  return finalizeEvent(
    {
      kind: 13,
      content: encrypNip44Message(privateKey, JSON.stringify(rumor), recipientPublicKey),
      created_at: now(),
      tags: [],
    },
    privateKey,
  ) as Event
}

export const createWrap = (event: Event, recipientPublicKey: string) => {
  const randomKey = generateSecretKey()
  return finalizeEvent(
    {
      kind: 1059,
      content: encrypNip44Message(randomKey, JSON.stringify(event), recipientPublicKey),
      created_at: now(),
      tags: [["p", recipientPublicKey]],
    },
    randomKey,
  ) as Event
}

export const decryptNip44Message = (
  cipher: string,
  publicKey: string,
  privateKey: Uint8Array,
) => {
  let conversationKey = nip44.v2.utils.getConversationKey(
    bytesToHex(privateKey),
    publicKey,
  )
  let message = nip44.v2.decrypt(cipher, conversationKey)
  return message
}

export const getRumorFromWrap = (wrapEvent: Event, privateKey: Uint8Array) => {
  let sealString = decryptNip44Message(wrapEvent.content, wrapEvent.pubkey, privateKey)
  let seal = JSON.parse(sealString) as Event
  let rumorString = decryptNip44Message(seal.content, seal.pubkey, privateKey)
  let rumor = JSON.parse(rumorString)
  return rumor
}

export const fetchSecretFromLocalStorage = async () => {
  let credentials = await Keychain.getInternetCredentials(KEYCHAIN_NOSTRCREDS_KEY)
  return credentials ? credentials.password : null
}

export const fetchGiftWrapsForPublicKey = (
  pubkey: string,
  eventHandler: (event: Event) => void,
  pool: SimplePool,
  flashRelay: string,
  since?: number,
) => {
  let filter: Filter = {
    "kinds": [1059],
    "#p": [pubkey],
    "limit": 150,
  }
  if (since) filter.since = since
  console.log("FETCHING MESSAGES for", filter, flashRelay)
  let closer = pool.subscribeMany(
    [flashRelay, "wss://relay.damus.io", "wss://nostr.oxtr.dev"],
    [filter],
    {
      onevent: eventHandler,
      onclose: () => {
        closer.close()
        console.log("Re-establishing connection")
        closer = fetchGiftWrapsForPublicKey(pubkey, eventHandler, pool, flashRelay)
      },
    },
  )
  return closer
}

export const convertRumorsToGroups = (rumors: Rumor[]) => {
  let groups: Map<string, Rumor[]> = new Map()
  rumors.forEach((rumor) => {
    let participants = rumor.tags.filter((t) => t[0] === "p").map((p) => p[1])
    let id = getGroupId([...participants, rumor.pubkey])
    groups.set(id, [...(groups.get(id) || []), rumor])
  })
  return groups
}

export const getGroupId = (participantsHex: string[]) => {
  const participantsSet = new Set(participantsHex)
  let participants = Array.from(participantsSet)
  participants.sort()
  let id = participants.join(",")
  return id
}

export const getSecretKey = async () => {
  let secretKeyString = await fetchSecretFromLocalStorage()
  if (!secretKeyString) {
    return null
  }
  let secret = nip19.decode(secretKeyString).data as Uint8Array
  return secret
}

export const fetchNostrUsers = (
  pubKeys: string[],
  pool: SimplePool,
  handleProfileEvent: (event: Event, closer: SubCloser) => void,
) => {
  const closer = pool.subscribeMany(
    publicRelays,
    [
      {
        kinds: [0],
        authors: pubKeys,
      },
    ],
    {
      onevent: (event: Event) => {
        handleProfileEvent(event, closer)
      },
      onclose: () => {
        closer.close()
      },
      oneose: () => {
        closer.close()
      },
    },
  )
  return closer
}

export const fetchPreferredRelays = async (pubKeys: string[], pool: SimplePool) => {
  let filter: Filter = {
    kinds: [10050],
    authors: pubKeys,
  }
  let relayEvents = await pool.querySync(publicRelays, filter)
  let relayMap = new Map<string, string[]>()
  relayEvents.forEach((event) => {
    relayMap.set(
      event.pubkey,
      event.tags.filter((t) => t[0] === "relay").map((t) => t[1]),
    )
  })
  return relayMap
}

export const sendNIP4Message = async (message: string, recipient: string) => {
  let privateKey = await getSecretKey()
  let NIP4Messages = {}
}

export const setPreferredRelay = async (flashRelay: string, secretKey?: Uint8Array) => {
  let pool = new SimplePool()
  console.log("inside setpreferredRelay")
  let secret: Uint8Array | null = null
  if (!secretKey) {
    secret = await getSecretKey()
    if (!secret) {
      Alert.alert("Nostr Private Key Not Assigned")
      return
    }
  } else {
    secret = secretKey
  }
  const pubKey = getPublicKey(secret)
  let relayEvent: UnsignedEvent = {
    pubkey: pubKey,
    tags: [
      ["relay", flashRelay],
      ["relay", "wss://relay.damus.io"],
      ["relay", "wss://relay.primal.net"],
    ],
    created_at: now(),
    kind: 10050,
    content: "",
  }
  const finalEvent = finalizeEvent(relayEvent, secret)
  let messages = await Promise.allSettled(pool.publish(publicRelays, finalEvent))
  console.log("Message from relays", messages)
  setTimeout(() => {
    pool.close(publicRelays)
  }, 5000)
}

export async function sendNip17Message(
  recipients: string[],
  message: string,
  preferredRelaysMap: Map<string, string[]>,
  onSent?: (rumor: Rumor) => void,
) {
  let privateKey = await getSecretKey()
  if (!privateKey) {
    throw Error("Couldnt find private key in local storage")
  }
  let p_tags = recipients.map((recipientId: string) => ["p", recipientId])
  let rumor = createRumor({ content: message, kind: 14, tags: p_tags }, privateKey)
  let outputs: { acceptedRelays: string[]; rejectedRelays: string[] }[] = []
  console.log("total recipients", recipients)
  await Promise.allSettled(
    recipients.map(async (recipientId: string) => {
      console.log("sending rumor for recipient ", recipientId)
      let recipientAcceptedRelays: string[] = []
      let recipientRelays = preferredRelaysMap.get(recipientId)
      if (!recipientRelays) sendNIP4Message(message, recipientId)
      recipientRelays = [
        ...(recipientRelays || publicRelays),
        "wss://relay.damus.io",
        "wss://nostr.oxtr.dev",
      ]
      let seal = createSeal(rumor, privateKey, recipientId)
      let wrap = createWrap(seal, recipientId)
      console.log("wrap created")
      try {
        let response = await Promise.allSettled(
          customPublish(
            recipientRelays,
            wrap,
            (url: string) => {
              console.log("Accepted relay callback triggered:", url)
              onSent?.(rumor)
              recipientAcceptedRelays.push(url)
            },
            (url: string) => {
              console.log("Rejected relay:", url)
            },
          ),
        )
      } catch (e) {
        console.log("error in publishing", e)
      }
      outputs.push({ acceptedRelays: recipientAcceptedRelays, rejectedRelays: [] })
    }),
  )
  console.log("Final output is", outputs)
  return { outputs, rumor }
}

export const ensureRelay = async (
  url: string,
  params?: { connectionTimeout?: number },
): Promise<AbstractRelay> => {
  url = normalizeURL(url)

  let relay = new Relay(url)
  if (params?.connectionTimeout) relay.connectionTimeout = params.connectionTimeout
  await relay.connect()

  return relay
}

export const customPublish = (
  relays: string[],
  event: Event,
  onAcceptedRelays?: (url: string) => void,
  onRejectedRelays?: (url: string) => void,
): Promise<string>[] => {
  console.log("Custom publish invoked ")
  const timeoutPromise = (url: string): Promise<string> =>
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Publish to ${url} timed out`)), 2000)
    })

  return relays.map(normalizeURL).map(async (url, i, arr) => {
    console.log("trying to publish to", url)
    if (arr.indexOf(url) !== i) {
      return Promise.reject("duplicate url")
    }
    return Promise.race([
      (async () => {
        let r = await ensureRelay(url)
        return r.publish(event).then(
          (value) => {
            console.log("Accepted on", url)
            onAcceptedRelays?.(url)
            return value
          },
          (reason: string) => {
            console.log("Rejected on", url)
            onRejectedRelays?.(url)
            return reason
          },
        )
      })(),
      timeoutPromise(url),
    ])
  })
}

function normalizeURL(url: string) {
  if (url.indexOf("://") === -1) url = "wss://" + url
  let p = new URL(url)
  p.pathname = p.pathname.replace(/\/+/g, "/")
  if (p.pathname.endsWith("/")) p.pathname = p.pathname.slice(0, -1)
  if (
    (p.port === "80" && p.protocol === "ws:") ||
    (p.port === "443" && p.protocol === "wss:")
  )
    p.port = ""
  p.searchParams.sort()
  p.hash = ""
  return p.toString()
}

export const loadGiftwrapsFromStorage = async () => {
  try {
    const savedGiftwraps = await AsyncStorage.getItem("giftwraps")
    return savedGiftwraps ? (JSON.parse(savedGiftwraps) as Event[]) : []
  } catch (e) {
    console.error("Error loading giftwraps from storage:", e)
    return []
  }
}

export const saveGiftwrapsToStorage = async (giftwraps: Event[]) => {
  try {
    await AsyncStorage.setItem("giftwraps", JSON.stringify(giftwraps))
  } catch (e) {
    console.error("Error saving giftwraps to storage:", e)
  }
}
