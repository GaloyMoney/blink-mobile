export type MyCryptoKey = {
  algorithm?: AesKeyAlgorithm // Replace with the type of your algorithm
  extractable: boolean
  type: string // You might want to define a more specific type for this
  usages?: ReadonlyArray<KeyUsage> // Replace with the type of your key usages
  key: string // The actual key data
}
