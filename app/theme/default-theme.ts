import { palette } from "./palette"

export type Theme = {
  colors: {
    primary: string
    primaryAccent: string
    background: string
    card: string
    text: string
    notification: string
    error: string
    warning: string
  }
  spacing: {
    xsmall: number
    small: number
    medium: number
    large: number
  }
  text: {
    xsmall: number
    small: number
    medium: number
    large: number
  }
  timing: {
    quick: number
  }
  font: {
    family: string
  }
}

export const defaultTheme = {
  colors: {
    primary: palette.galoyBlue,
    primaryAccent: palette.btcSecondary,
    background: palette.lighterGrey,
    card: palette.white,
    text: palette.black,
    notification: palette.black,
    error: palette.red,
    warning: palette.orange,
  },
  spacing: {
    xsmall: 8,
    small: 14,
    medium: 20,
    large: 26,
  },
  text: {
    xsmall: 8,
    small: 14,
    medium: 20,
    large: 26,
  },
  timing: {
    quick: 300,
  },
  font: {
    family: "System",
  },
} as Theme
