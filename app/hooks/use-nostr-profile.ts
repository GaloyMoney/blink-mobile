import { useState, useEffect } from "react"
import * as Keychain from "react-native-keychain"
import { nip19, generateSecretKey, getPublicKey, SimplePool } from "nostr-tools"

const useNostrProfile = () => {
  const KEYCHAIN_NOSTRCREDS_KEY = "nostr_creds_key"
  const [nostrSecretKey, setNostrSecretKey] = useState<string>("")
  const relays = ["wss://relay.damus.io", "wss://relay.primal.net", "wss://purplepag.es"]

  useEffect(() => {
    const initializeNostrProfile = async () => {
      try {
        console.log("Looking for nostr creds in keychain")
        const credentials = await Keychain.getInternetCredentials(KEYCHAIN_NOSTRCREDS_KEY)
        if (credentials) {
          setNostrSecretKey(credentials.password)
          return
        }
        const nostrSecret = nip19.nsecEncode(generateSecretKey())
        await Keychain.setInternetCredentials(
          KEYCHAIN_NOSTRCREDS_KEY,
          KEYCHAIN_NOSTRCREDS_KEY,
          nostrSecret,
        )
        setNostrSecretKey(nostrSecret)
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
        pubkey: nostrProfile.pubkey,
      }
    } catch (error) {
      console.error("Error parsing nostr profile: ", error)
      throw error
    }
  }

  const getPubkey = (nostrSecretKey: string) => {
    if (!nostrSecretKey) {
      return ""
    }
    return getPublicKey(nip19.decode(nostrSecretKey).data as Uint8Array)
  }

  return {
    nostrSecretKey,
    nostrPubKey: getPubkey(nostrSecretKey),
    fetchNostrUser,
  }
}

export default useNostrProfile
