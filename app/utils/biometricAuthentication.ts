import FingerprintScanner from "react-native-fingerprint-scanner"

export default class BiometricWrapper {
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
    await FingerprintScanner.release()
    FingerprintScanner.authenticate({
      description: description,
      fallbackEnabled: true,
    })
      .then(() => {
        handleSuccess()
      })
      .catch((error) => {
        console.log({ error }, "error during biometric authentication")
        handleFailure()
      })
      .finally(() => {
        FingerprintScanner.release()
      })
  }
}
