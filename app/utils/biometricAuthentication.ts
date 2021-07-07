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

  public static async authenticate(description, handleSuccess, handleFailure) {
    await FingerprintScanner.release()
    FingerprintScanner.authenticate({
      description: description,
      fallbackEnabled: true,
    })
      .then(() => {
        handleSuccess()
      })
      .catch((error) => {
        handleFailure()
      })
      .finally(() => {
        FingerprintScanner.release()
      })
  }
}
