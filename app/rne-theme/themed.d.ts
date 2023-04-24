import "@rneui/themed"

declare module "@rneui/themed" {
  export interface Colors {
    primary3: string
    primary5: string
    primary6: string
    primary7: string
    primary8: string
    primary9: string
    primary10: string
    backgroundPrimary10: string
    secondary5: string
    secondary8: string
    success5: string
    success9: string
    error4: string
    error5: string
    error8: string
    error9: string
    warning4: string
    warning9: string
    whiteOrDarkGrey: string
    darkGreyOrWhite: string
    lapisLazuliOrLightGrey: string
    grey9OrWhite: string
    lighterGreyOrBlack: string
    loaderForeground: string
    loaderBackground: string
    grey7: string
    grey8: string
    grey10: string
    grey9: string
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
