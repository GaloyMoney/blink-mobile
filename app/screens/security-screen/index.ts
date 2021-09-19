export * from "./security-screen"
export * from "./two-factor-authentication-selection-screen"
export * from "./two-factor-authentication-secret-screen"
export * from "./two-factor-authentication-verification-screen"

export const TwoFAVerificationType = {
  QR: "QR",
  Linking: "Linking",
  CopySecret: "Copy Secret",
  Delete: "Delete",
} as const
