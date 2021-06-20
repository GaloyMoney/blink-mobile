import { translate } from "../i18n"
import FingerprintScanner from 'react-native-fingerprint-scanner'


export const isSensorAvailable = async () => {
  const telemetryType = await FingerprintScanner.isSensorAvailable()
  return telemetryType !== null
}

export const authenticate = async (handleSuccess, handleFailure) => {
  await FingerprintScanner.release()
  FingerprintScanner
    .authenticate({ 
      description: translate("AuthenticationScreen.authenticationDescription"),
      fallbackEnabled: true
    })
    .then(() => {
      FingerprintScanner.release()
      handleSuccess()
    })
    .catch((error) => {
      FingerprintScanner.release()
      handleFailure()
    });
}