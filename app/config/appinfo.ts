import { AndroidMarket } from "react-native-rate"

export const WHATSAPP_CONTACT_NUMBER = "+16787722551"
export const BLOCKCHAIN_EXPLORER_URL = "https://mempool.space/tx/"
export const CONTACT_EMAIL_ADDRESS = "support@puravidabitcoin.io"
export const APP_STORE_LINK =
  "https://apps.apple.com/us/app/pura-vida-bitcoin/id6443837514"
export const PLAY_STORE_LINK =
  "https://play.google.com/store/apps/details?id=io.puravidabitcoin.app"
export const PREFIX_LINKING = [
  "https://ln.bitcoinbeach.com",
  "https://pay.mainnet.galoy.io",
  "https://pay.bbw.sv",
  "https://pay.blink.sv",
  "bitcoinbeach://",
]

// FIXME this should come from globals.lightningAddressDomainAliases
export const LNURL_DOMAINS = ["ln.bitcoinbeach.com", "pay.bbw.sv", "blink.sv"]

export const ratingOptions = {
  AppleAppID: "1531383905",
  GooglePackageName: "com.galoyapp",
  preferredAndroidMarket: AndroidMarket.Google,
  preferInApp: true,
  openAppStoreIfInAppFails: true,
}
