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

type JwtPayload = {
  uid: string
  network: INetwork
}

type TokenPayload = {
  uid: string
  network: INetwork
  token: string
}

declare module "react-native-restart" {
  const module: { Restart: () => void }
  export default module
}

declare module "react-native-walkthrough-tooltip" {
  export interface TooltipProps {
    children: React.ReactNode
  }
}
declare interface MarkdownProps {
  rules?: RenderRules
  children?: ReactNode
  style?: StyleSheet.NamedStyles<any>
  renderer?: AstRenderer
  markdownit?: MarkdownIt
  mergeStyle?: boolean
  debugPrintTree?: boolean
  onLinkPress?: (url: string) => boolean
}

declare type MarkdownStatic = ComponentType<MarkdownProps>
