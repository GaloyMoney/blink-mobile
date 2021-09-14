declare module "*.svg" {
  import React from "react"
  import { SvgProps } from "react-native-svg"
  const content: React.FC<SvgProps>
  export default content
}

declare module "*.png" {
  const content: string
  export default content
}

declare module "*.json" {
  const content: string
  export default content
}
