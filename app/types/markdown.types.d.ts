type OriginalMarkdownProps = typeof import("react-native-markdown-display")

declare module "react-native-markdown-display" {
  interface MarkdownProps extends OriginalMarkdownProps {
    children?: React.ReactNode
    style?: React.CSSProperties
  }
}
