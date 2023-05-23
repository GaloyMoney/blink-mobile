import "@rneui/themed"

declare module "@rneui/themed" {
  export interface Colors {
    red: string
    green: string
    transparent: string

    // _ are meant to be static across light and dark
    // either because they are used in screen that require no inversion
    // like for the QR code, or camera view
    // or because they are used in the earn section which is not dark/light mode aware

    _white: string
    _black: string
    _lightGrey: string
    _lighterGrey: string
    _lightBlue: string
    _darkGrey: string
    _blue: string
    _orange: string
    _sky: string

    btcForeground: string
    btcBackground: string
    usdForeground: string
    usdBackground: string

    primary3: string
    primary4: string
    primary5: string
    error5: string
    error9: string

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
