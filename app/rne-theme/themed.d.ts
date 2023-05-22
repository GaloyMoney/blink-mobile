import "@rneui/themed"

declare module "@rneui/themed" {
  export interface Colors {
    red: string
    green: string
    transparent: string

    _white: string
    _black: string
    _lightGrey: string
    _blue: string

    usdSecondary: string
    btcSecondary: string

    primary1: string
    primary3: string
    primary4: string
    primary5: string
    backgroundPrimary5: string
    secondary5: string
    secondary8: string
    success5: string
    success9: string
    error4: string
    error5: string
    error9: string
    warning4: string
    warning9: string
    whiteOrDarkGrey: string
    darkGreyOrWhite: string
    lapisLazuliOrLightGrey: string
    grey10OrWhite: string
    lighterGreyOrBlack: string
    loaderForeground: string
    loaderBackground: string
    horizonBlue: {
      colors: string[]
      start: {
        x: number
        y: number
      }
      end: {
        x: number
        y: number
      }
    }
    verticalBlue: {
      colors: string[]
      start: {
        x: number
        y: number
      }
      end: {
        x: number
        y: number
      }
    }
  }

  export interface TextProps {
    bold?: boolean
    type?: "p1" | "p2" | "p3" | "p4" | "h1" | "h2"
    color?: string
  }

  export interface ComponentTheme {
    Text: Partial<TextProps>
  }
}
