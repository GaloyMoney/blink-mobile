export const AuthenticationScreenPurpose = {
  Authenticate: "Authenticate",
  TurnOnAuthentication: "TurnOnAuthentication",
  ShowSeedPhrase: "showSeedPhrase",
} as const

export const PinScreenPurpose = {
  AuthenticatePin: "AuthenticatePin",
  SetPin: "SetPin",
  ShowSeedPhrase: "showSeedPhrase",
} as const

export type AuthenticationScreenPurpose =
  (typeof AuthenticationScreenPurpose)[keyof typeof AuthenticationScreenPurpose]
export type PinScreenPurpose = (typeof PinScreenPurpose)[keyof typeof PinScreenPurpose]
