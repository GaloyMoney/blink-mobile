/* eslint-disable @typescript-eslint/no-unused-vars */
import { NativeModules } from "react-native"
import Aes from "react-native-aes-crypto"
// import { getRandomValues } from "react-native-get-random-values"
// import forge from "node-forge"
import { MyCryptoKey } from "../types/crypto"

// export const importKey = async ({
//   format,
//   keyData,
//   algorithm,
//   extractable,
//   keyUsages,
// }: {
//   format: string
//   keyData: BufferSource
//   algorithm: AesKeyAlgorithm
//   extractable: boolean
//   keyUsages: ReadonlyArray<KeyUsage>
// }): Promise<MyCryptoKey> => {
//   const keyMaterial = keyData.toString()
//   const saltBuffer = new Uint8Array(16) // 16 bytes salt
//   getRandomValues(saltBuffer)
//   const saltString = Buffer.from(saltBuffer).toString("hex")
//   const key = await Aes.pbkdf2(keyMaterial, saltString, 5000, 256)
//   const keyBytes = forge.util.hexToBytes(key)
//   const forgeKey = forge.pkcs5.pbkdf2(keyMaterial, saltString, 5000, keyBytes.length)
//   return forgeKey
// }

export const digest = async ({
  algorithm,
  data,
}: {
  algorithm: AlgorithmIdentifier
  data: BufferSource
}): Promise<ArrayBuffer> => {
  const digest = await Aes.sha256(data.toString())
  const buffer = new Uint8Array(digest.length)
  for (let i = 0; i < digest.length; i += 1) {
    buffer[i] = digest.charCodeAt(i)
  }
  return buffer.buffer
}

export const decrypt = async ({
  algorithm,
  key,
  data,
}: {
  algorithm: AesGcmParams
  key: MyCryptoKey
  data: BufferSource
}): Promise<ArrayBuffer> => {
  const dataArray = new Uint8Array(data as ArrayBuffer)
  let dataString = ""
  dataArray.forEach((byte) => {
    dataString += String.fromCharCode(byte)
  })
  const ivArray = new Uint8Array(algorithm.iv as ArrayBuffer)
  let ivString = ""
  ivArray.forEach((byte) => {
    ivString += String.fromCharCode(byte)
  })
  const decrypted = await Aes.decrypt(dataString, key.key, ivString, "aes-256-cbc")
  const buffer = new Uint8Array(decrypted.length)
  for (let i = 0; i < decrypted.length; i += 1) {
    buffer[i] = decrypted.charCodeAt(i)
  }
  return buffer.buffer
}

export const encrypt = async ({
  algorithm,
  key,
  data,
}: {
  algorithm: AesGcmParams
  key: MyCryptoKey
  data: BufferSource
}): Promise<ArrayBuffer> => {
  const dataArray = new Uint8Array(data as ArrayBuffer)
  let dataString = ""
  dataArray.forEach((byte) => {
    dataString += String.fromCharCode(byte)
  })
  const ivArray = new Uint8Array(algorithm.iv as ArrayBuffer)
  let ivString = ""
  ivArray.forEach((byte) => {
    ivString += String.fromCharCode(byte)
  })
  const encrypted = await Aes.encrypt(dataString, key.key, ivString, "aes-256-cbc")
  const buffer = new Uint8Array(encrypted.length)
  for (let i = 0; i < encrypted.length; i += 1) {
    buffer[i] = encrypted.charCodeAt(i)
  }
  return buffer.buffer
}
