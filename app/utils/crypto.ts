/* eslint-disable prefer-const */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { secp256k1 } from "@noble/curves/secp256k1"
import { randomBytes } from "react-native-randombytes"
import { sha256 } from "@noble/hashes/sha256"
import { base64 } from "@scure/base"
import { streamXOR as xchacha20 } from "@stablelib/xchacha20"

export function getConversationKey(privkeyA: string, pubkeyB: string) {
  const key = secp256k1.getSharedSecret(privkeyA, "02" + pubkeyB)
  return sha256(key.slice(1, 33))
}

export function encrypt(privkey: string, pubkey: string, text: string, ver = 1): string {
  if (ver !== 1) throw new Error("NIP44: unknown encryption version")
  let key = getConversationKey(privkey, pubkey)
  let nonce = randomBytes(24)
  let plaintext = new TextEncoder().encode(text)
  let ciphertext = xchacha20(key, nonce, plaintext, plaintext)
  let ctb64 = base64.encode(ciphertext)
  let nonceb64 = base64.encode(nonce)
  return JSON.stringify({ ciphertext: ctb64, nonce: nonceb64, v: 1 })
}

export function decrypt(privkey: string, pubkey: string, data: string): string {
  let dt = JSON.parse(data)
  if (dt.v !== 1) throw new Error("NIP44: unknown encryption version")
  let { ciphertext, nonce } = dt
  ciphertext = base64.decode(ciphertext)
  nonce = base64.decode(nonce)
  let key = getConversationKey(privkey, pubkey)
  let plaintext = xchacha20(key, nonce, ciphertext, ciphertext)
  let text = new TextDecoder().decode(plaintext)
  return text
}
