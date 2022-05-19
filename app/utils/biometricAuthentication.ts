import FingerprintScanner from "react-native-fingerprint-scanner"

export default class BiometricWrapper {
  private static isHandlingAuthenticate = false

  public static async isSensorAvailable(): Promise<boolean> {
    try {
      const biometryType = await FingerprintScanner.isSensorAvailable()
      return biometryType !== null
    } catch {
      return false
    }
  }

  public static async authenticate(
    description: string,
    handleSuccess: () => void,
    handleFailure: () => void,
  ): Promise<void> {
    if (this.isHandlingAuthenticate) return
    this.isHandlingAuthenticate = true

    await FingerprintScanner.release()
    FingerprintScanner.authenticate({
      description,
      fallbackEnabled: true,
    })
      .then(() => {
        handleSuccess()
      })
      .catch((error) => {
        console.debug({ error }, "error during biometric authentication")
        handleFailure()
      })
      .finally(() => {
        FingerprintScanner.release()
        this.isHandlingAuthenticate = false
      })
  }
}
