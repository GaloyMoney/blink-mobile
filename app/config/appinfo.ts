import { AndroidMarket } from "react-native-rate"

export const WHATSAPP_CONTACT_NUMBER = "+50369835117"
export const CONTACT_EMAIL_ADDRESS = "support@blink.sv"
export const APP_STORE_LINK =
  "https://apps.apple.com/app/bitcoin-beach-wallet/id1531383905"
export const PLAY_STORE_LINK =
  "https://play.google.com/store/apps/details?id=com.galoyapp"
export const PREFIX_LINKING = [
  "https://ln.bitcoinbeach.com",
  "https://pay.mainnet.galoy.io",
  "https://pay.bbw.sv",
  "https://pay.blink.sv",
  "bitcoinbeach://",
]

// FIXME this should come from globals.lightningAddressDomainAliases
export const LNURL_DOMAINS = [
  "ln.bitcoinbeach.com",
  "pay.bbw.sv",
  "blink.sv",
  "pay.blink.sv",
]

export const ratingOptions = {
  AppleAppID: "1531383905",
  GooglePackageName: "com.galoyapp",
  preferredAndroidMarket: AndroidMarket.Google,
  preferInApp: true,
  openAppStoreIfInAppFails: true,
}

export const getInviteLink = (_username: string | null | undefined) => {
  const username = _username ? `/${_username}` : ""
  return `https://get.blink.sv${username}`
}
