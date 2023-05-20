import { palette } from "@app/theme"

const light = {
  primary: "#1627C4",
  primary3: "#1627C4",
  primary5: "#4453E2",
  primary6: "#6775F3",
  primary7: "#A4ABF2",
  primary8: "#CACFFD",
  primary9: "#E6E8FA",
  primary10: "#F0F0F7",
  backgroundPrimary10: "rgba(240, 240, 247, 0.8)",
  secondary: "#FB5607",
  secondary5: "#FB5607",
  secondary8: "#FFD0BA",
  success: "#00A700",
  success5: "#00A700",
  success9: "#C6EBC6",
  error: "#DC2626",
  error4: "#DC2626",
  error5: "#EF4444",
  error8: "#FECACA",
  error9: "#FEE2E2",
  warning: "#F59E0B",
  warning4: "#F59E0B",
  warning9: "#FEF3C7",
  white: "#FFFFFF",
  black: "#000000",
  grey0: "#3A3C51", // grey1
  grey1: "#61637A", // grey3
  grey2: "#9292A0", // grey4
  grey3: "#AEAEB8", // grey5
  grey4: "#F0F0F2", // grey8
  grey5: "#F8F8FA", // grey9
  horizonBlue: {
    colors: ["#4453E2", "#5269FF"],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  verticalBlue: {
    colors: ["#5269FF", "#4453E2"],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },

  // legacy
  whiteOrDarkGrey: "#FFFFFF",
  lapisLazuliOrLightGrey: palette.lapisLazuli,
  darkGreyOrWhite: palette.darkGrey,
  grey10OrWhite: "#F0F0F2",
  lighterGreyOrBlack: palette.lighterGrey,
  loaderForeground: "#ecebeb",
  loaderBackground: "#f3f3f3",
}

const dark = {
  primary: "#8690F3", // intermadiate color between primary6 and 7 from light mode
  primary3: "#1627C4",
  primary5: "#4453E2",
  primary6: "#6775F3",
  primary7: "#A4ABF2",
  primary8: "#CACFFD",
  primary9: "#E6E8FA",
  primary10: "#F0F0F7",
  backgroundPrimary10: "rgba(97, 99, 122, 0.8)",
  secondary: "#FB5607",
  secondary5: "#FB5607",
  secondary8: "#FFD0BA",
  success: "#00A700",
  success5: "#00A700",
  success9: "#C6EBC6",
  error: "#DC2626",
  error4: "#DC2626",
  error5: "#EF4444",
  error8: "#FECACA",
  error9: "#FEE2E2",
  warning: "#F59E0B",
  warning4: "#F59E0B",
  warning9: "#FEF3C7",
  white: "#000000", // <-- this is the only change
  black: "#FFFFFF", // <-- this is the only change

  grey0: "#FAF9F9", // grey1
  grey1: "#E9E8E8", // grey2
  grey2: "#CCCCCC", // grey3
  grey3: "#949494", // grey5
  grey4: "#393939", // grey8
  grey5: "#1d1d1d", // after grey9

  horizonBlue: {
    colors: ["#4453E2", "#5269FF"],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  verticalBlue: {
    colors: ["#5269FF", "#4453E2"],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },

  // legacy
  whiteOrDarkGrey: palette.darkGrey, // <-- this is the only change
  lapisLazuliOrLightGrey: palette.lightGrey, // <-- this is the only change
  darkGreyOrWhite: palette.white, // <-- should it be white or light grey?
  grey10OrWhite: palette.white,
  lighterGreyOrBlack: palette.black,
  loaderBackground: "#131313",
  loaderForeground: "#3c3b3b",
}

export { light, dark }
