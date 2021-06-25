import RNSecureKeyStore, {ACCESSIBLE} from "react-native-secure-key-store"

export default class KeyStoreWrapper {

  private static readonly IS_BIOMETRY_ENABLED = "isBiometryEnabled"
  private static readonly PIN = "PIN"
  private static readonly PIN_ATTEMPTS = "pinAttempts"

  // Set Key Value

  public static async setIsBiometryEnabled() : Promise<Boolean> {
    try {

      await RNSecureKeyStore.set(KeyStoreWrapper.IS_BIOMETRY_ENABLED, "1", {accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY})
      return true
    } catch {
      return false
    }
  }

  public static async setPin(pin: string) : Promise<Boolean> {
    try {
      await RNSecureKeyStore.set(KeyStoreWrapper.PIN, pin, {accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY})
      return true
    } catch {
      return false
    }
  }

  public static async setPinAttempts(pinAttempts: string) : Promise<Boolean> {
    try {
      await RNSecureKeyStore.set(KeyStoreWrapper.PIN_ATTEMPTS, pinAttempts, {accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY})
      return true
    } catch {
      return false
    }
  }

  // Get Key Value

  public static async getIsBiometryEnabled() : Promise<Boolean> {
    try {
      await RNSecureKeyStore.get(KeyStoreWrapper.IS_BIOMETRY_ENABLED)
      return true
    } catch {
      return false
    }
  }

  public static async getPinOrEmptyString() : Promise<string> {
    try {
      return await RNSecureKeyStore.get(KeyStoreWrapper.PIN)
    } catch {
      return ""
    }
  }

  public static async getPinAttemptsOrZero() : Promise<Number> {
    try {
      return Number(await RNSecureKeyStore.get(KeyStoreWrapper.PIN_ATTEMPTS))
    } catch {
      return 0
    }
  }

  // Remove Key Value

  public static async removeIsBiometricsEnabled() : Promise<Boolean> {
    try {
      await RNSecureKeyStore.remove(KeyStoreWrapper.IS_BIOMETRY_ENABLED)
      return true
    } catch {
      return false
    }
  }

  public static async removePin() : Promise<Boolean> {
    try {
      await RNSecureKeyStore.remove(KeyStoreWrapper.PIN)
      return true
    } catch {
      return false
    }
  }

  public static async removePinAttempts() : Promise<Boolean> {
    try {
      await RNSecureKeyStore.remove(KeyStoreWrapper.PIN_ATTEMPTS)
      return true
    } catch {
      return false
    }
  }
}
