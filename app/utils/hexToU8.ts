export function hexStringToUint8Array(hexString: string): Uint8Array {
  if (hexString.length % 2 !== 0) {
    // eslint-disable-next-line no-throw-literal
    throw "Invalid hexString"
  }
  const arrayBuffer = new Uint8Array(hexString.length / 2)

  for (let i = 0; i < hexString.length; i += 2) {
    const byteValue = parseInt(hexString.substr(i, 2), 16)
    if (isNaN(byteValue)) {
      // eslint-disable-next-line no-throw-literal
      throw "Invalid hexString"
    }
    arrayBuffer[i / 2] = byteValue
  }
  return arrayBuffer
}
