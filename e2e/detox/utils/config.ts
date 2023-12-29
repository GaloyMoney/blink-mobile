export const timeout = 3000

// Staging or Local
export const testEnvironment = () => process.env.TEST_ENV || "Staging"

const getRandomPhoneNumber = (): string => {
  const randomDigits = Math.floor(Math.random() * 40 + 60) // Generates a number between 60 and 99
    .toString()
  return `+503650555${randomDigits}`
}

export const phoneNumber = getRandomPhoneNumber()
export const otp =
  (testEnvironment() === "Staging" && process.env.GALOY_STAGING_GLOBAL_OTP) || "000000"
