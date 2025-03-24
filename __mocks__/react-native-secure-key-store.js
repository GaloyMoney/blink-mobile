import { ACCESSIBLE } from "react-native-secure-key-store"

export { ACCESSIBLE }

class RNSecureKeyStoreMock {
  store

  constructor() {
    this.store = new Map()
  }

  get(k) {
    const result = this.store.get(k)
    return Promise.resolve(result)
  }

  remove(k) {
    this.store.delete(k)
    return Promise.resolve(true)
  }

  set(k, value) {
    this.store.set(k, value)
    return Promise.resolve(true)
  }
}

const RNSecureKeyStore = new RNSecureKeyStoreMock()

export default RNSecureKeyStore
