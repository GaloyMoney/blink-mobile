import { Platform } from "react-native"

export const isUpdateAvailableOrRequired = ({
  buildNumber,
  mobileVersions,
  OS,
}: {
  buildNumber: number
  mobileVersions:
    | readonly ({
        readonly platform: string
        readonly currentSupported: number
        readonly minSupported: number
      } | null)[]
    | null
    | undefined
  OS: Platform["OS"]
}) => {
  if (!mobileVersions) {
    return {
      required: false,
      available: false,
    }
  }

  // we need to use the modulo because the build number is not the same across ABI
  // and we are multiple by a factor of 10000000 to differentiate between platforms
  // https://github.com/GaloyMoney/galoy-mobile/blob/c971ace92e420e8f90cab209cb9e2c341b71ab42/android/app/build.gradle#L145
  const buildNumberNoAbi = buildNumber % 10000000

  const mobileVersionsNonNull = mobileVersions.map((x) => ({
    platform: x?.platform,
    currentSupported: x?.currentSupported,
    minSupported: x?.minSupported,
  }))

  const minSupportedVersion =
    mobileVersionsNonNull.find((mobileVersion) => mobileVersion?.platform === OS)
      ?.minSupported ?? NaN

  const currentSupportedVersion =
    mobileVersionsNonNull.find((mobileVersion) => mobileVersion?.platform === OS)
      ?.currentSupported ?? NaN

  return {
    required: buildNumberNoAbi < minSupportedVersion,
    available: buildNumberNoAbi < currentSupportedVersion,
  }
}
