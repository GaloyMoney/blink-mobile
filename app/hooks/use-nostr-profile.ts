import { useState, useEffect } from "react"
import * as Keychain from "react-native-keychain"
import {
  nip19,
  generateSecretKey,
  getPublicKey,
  SimplePool,
  nip04,
  finalizeEvent,
} from "nostr-tools"
import { getSecretKey, setPreferredRelay } from "@app/utils/nostr"
import { useHomeAuthedQuery, useUserUpdateNpubMutation } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useAppConfig } from "./use-app-config"
import { save } from "@app/utils/storage"

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

  const saveNewNostrKey = async () => {
    let secretKey = generateSecretKey()
    const nostrSecret = nip19.nsecEncode(secretKey)
    await Keychain.setInternetCredentials(
      KEYCHAIN_NOSTRCREDS_KEY,
      KEYCHAIN_NOSTRCREDS_KEY,
      nostrSecret,
    )
    await userUpdateNpubMutation({
      variables: {
        input: {
          npub: nip19.npubEncode(getPublicKey(secretKey)),
        },
      },
    })
    await setPreferredRelay(relayUrl, secretKey)
    return secretKey
  }

  useEffect(() => {
    const initializeNostrProfile = async () => {
      try {
        const credentials = await fetchSecretFromLocalStorage()
        let accountNpub = dataAuthed?.me?.npub
        if (credentials) {
          let secret = nip19.decode(credentials).data as Uint8Array
          if (isAuthed && dataAuthed?.me && !accountNpub) {
            console.log("Updating New Nostr Profile")
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
        console.error("Error fetching nostr secret: ", error)
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
    let publicRelays = [
      ...relays,
      relayUrl,
      "wss://relay.damus.io",
      "wss://relay.primal.net",
      "wss://nos.lol",
    ]
    let secret = await getSecretKey()
    if (!secret) {
      if (dataAuthed && dataAuthed.me && !dataAuthed.me.npub) {
        secret = await saveNewNostrKey()
      } else {
        throw Error("Could not verify npub")
      }
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

  return {
    fetchNostrUser,
    updateNostrProfile,
    saveNewNostrKey,
  }
}

export default useNostrProfile
