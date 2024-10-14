import { AndroidMarket } from "react-native-rate"

export const WHATSAPP_CONTACT_NUMBER = "+18762909250"
export const CONTACT_EMAIL_ADDRESS = "support@getflash.io"
export const APP_STORE_LINK =
  "https://apps.apple.com/jm/app/flash-send-spend-and-save/id6451129095"
export const PLAY_STORE_LINK = "https://play.google.com/store/apps/details?id=com.lnflash"
export const PREFIX_LINKING = ["https://pay.getflash.io", "flash://"]

// FIXME this should come from globals.lightningAddressDomainAliases
export const LNURL_DOMAINS = ["getflash.io", "pay.flashapp.me", "flashapp.me"]

export const ratingOptions = {
  AppleAppID: "6451129095",
  GooglePackageName: "com.lnflash",
  preferredAndroidMarket: AndroidMarket.Google,
  preferInApp: true,
  openAppStoreIfInAppFails: true,
}

export const FLASH_DEEP_LINK_PREFIX = "flash:/"
