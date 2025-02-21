import { SetAddressError } from "@app/types/errors"

export const validateLightningAddress = (
  lightningAddress: string,
): ValidateLightningAddressResult => {
  if (lightningAddress.length < 3) {
    return {
      valid: false,
      error: SetAddressError.TOO_SHORT,
    }
  }

  if (lightningAddress.length > 50) {
    return {
      valid: false,
      error: SetAddressError.TOO_LONG,
    }
  }

  if (!/^[\p{L}0-9_]+$/u.test(lightningAddress)) {
    return {
      valid: false,
      error: SetAddressError.INVALID_CHARACTER,
    }
  }

  return {
    valid: true,
  }
}

type ValidateLightningAddressResult =
  | {
      valid: true
    }
  | {
      valid: false
      error: SetAddressError
    }
