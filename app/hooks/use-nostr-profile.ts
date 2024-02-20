import { useState, useEffect } from "react"
import * as Keychain from "react-native-keychain"
import { nip19, generateSecretKey } from "nostr-tools"

const useNostrProfile = () => {
  const KEYCHAIN_NOSTRCREDS_KEY = "nostr_creds_key"
  const [nostrSecretKey, setNostrSecretKey] = useState<string>("")

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

  return { nostrSecretKey }
}

export default useNostrProfile
