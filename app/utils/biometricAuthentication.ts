import { translate } from "../i18n"
import FingerprintScanner from 'react-native-fingerprint-scanner'

export const isSensorAvailable = (handleSuccess, handleFailure) => {
  FingerprintScanner
    .isSensorAvailable()
    .then(biometryType => handleSuccess(biometryType !== null))
    .catch((error) => {
      handleFailure()
    })
}

export const authenticate = async (handleSuccess, handleFailure) => {
  await FingerprintScanner.release()
  FingerprintScanner
    .authenticate({ 
      description: translate("AuthenticationScreen.authenticationDescription"),
      fallbackEnabled: true
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