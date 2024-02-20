import { base64ToBytes as b64ToBytes } from "byte-base64"
import Long from "long"

type BytesLikeType = Uint8Array | number[] | string
type LongLikeType = Long | string | number

export const base64ToBytes = (data: BytesLikeType): Uint8Array => {
  return typeof data === "string"
    ? b64ToBytes(data)
    : data instanceof Uint8Array
    ? data
    : Uint8Array.from(data || [])
}

export const toLong = (value: LongLikeType | Uint8Array): Long => {
  return value instanceof Uint8Array
    ? Long.fromBytes(toNumberArray(value))
    : Array.isArray(value)
    ? Long.fromBytes(value)
    : Long.fromValue(value)
}

export const toMilliSatoshi = (value: LongLikeType): Long => {
  return toLong(value).multiply(1000)
}

export const toNumberArray = (arr: Uint8Array): number[] => {
  let numberArr: number[] = []

  for (let i = 0; i < arr.length; i++) {
    numberArr = numberArr.concat(arr[i])
  }

  return numberArr
}
