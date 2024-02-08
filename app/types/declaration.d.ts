declare module "*.svg" {
  import React from "react"
  import { SvgProps } from "react-native-svg"
  const content: React.FC<SvgProps>
  export default content
}

declare module "*.png" {
  import { ImageSourcePropType } from "react-native"
  const content: ImageSourcePropType
  export default content
}

declare module "*.json" {
  const content: string
  export default content
}

declare module "react-native-walkthrough-tooltip" {
  export interface TooltipProps {
    children: React.ReactNode
  }
}

declare module "@env" {
  export const APP_CHECK_IOS_DEBUG_TOKEN: string
  export const APP_CHECK_ANDROID_DEBUG_TOKEN: string
  export const INVITE_CODE: string
  export const MNEMONIC_WORDS: string
  export const API_KEY: string
  export const GREENLIGHT_PARTNER_CERT: string
  export const GREENLIGHT_PARTNER_KEY: string
}
