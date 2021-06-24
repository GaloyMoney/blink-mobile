import FingerprintScanner from "react-native-fingerprint-scanner"

export const isSensorAvailable = (handleSuccess, handleFailure) => {
  FingerprintScanner.isSensorAvailable()
    .then((biometryType) => handleSuccess(biometryType !== null))
    .catch((error) => {
      console.log(error)
      handleFailure()
    })
}

export const authenticate = async (description, handleSuccess, handleFailure) => {
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
