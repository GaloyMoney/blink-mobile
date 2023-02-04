import FingerprintScanner from "react-native-fingerprint-scanner"
import crashlytics from "@react-native-firebase/crashlytics"
export default class BiometricWrapper {
  private static isHandlingAuthenticate = false

  public static async isSensorAvailable(): Promise<boolean> {
    try {
      const biometryType = await FingerprintScanner.isSensorAvailable()
      return biometryType !== null
    } catch (err: unknown) {
      if (err instanceof Error) {
        crashlytics().recordError(err)
      }
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

    try {
      FingerprintScanner.release()
      await FingerprintScanner.authenticate({
        description,
        fallbackEnabled: true,
      })

      handleSuccess()
    } catch (err: unknown) {
      if (err instanceof Error) {
        crashlytics().recordError(err)
      }
      console.debug({ err }, "error during biometric authentication")
      handleFailure()
    } finally {
      FingerprintScanner.release()
      this.isHandlingAuthenticate = false
    }
  }
}
