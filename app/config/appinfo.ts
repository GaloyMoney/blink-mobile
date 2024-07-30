import { AndroidMarket } from "react-native-rate"

export const WHATSAPP_CONTACT_NUMBER = "+18764250250"
export const CONTACT_EMAIL_ADDRESS = "support@lnflash.me"
export const APP_STORE_LINK =
  "https://apps.apple.com/app/bitcoin-beach-wallet/id1531383905"
export const PLAY_STORE_LINK = "https://play.google.com/store/apps/details?id=com.lnflash"
export const PREFIX_LINKING = [
  "https://pay.flashapp.me",
  "https://pay.getflash.io",
  "https://pay.lnflash.me",
  "flash://",
]

// FIXME this should come from globals.lightningAddressDomainAliases
export const LNURL_DOMAINS = ["lnflash.me", "pay.lnflash.me", "flashapp.me"]

export const ratingOptions = {
  AppleAppID: "1531383905",
  GooglePackageName: "com.lnflash",
  preferredAndroidMarket: AndroidMarket.Google,
  preferInApp: true,
  openAppStoreIfInAppFails: true,
}

export const FLASH_DEEP_LINK_PREFIX = "flash:/"
