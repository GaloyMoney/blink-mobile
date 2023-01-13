import { MarkdownProps as OriginalMarkdownProps } from "react-native-markdown-display"

declare module "react-native-markdown-display" {
  interface MarkdownProps extends OriginalMarkdownProps {
    children?: React.ReactNode;
  }
}
