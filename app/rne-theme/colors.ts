const light = {
  _white: "#FFFFFF",
  _black: "#000000",
  _lightGrey: "#CFD9E2",
  _lighterGrey: "#E6EBEf",
  _lightBlue: "#3553FF",
  _darkGrey: "#1d1d1d",
  _blue: "#3050C4",
  _orange: "#FF7e1c",
  _sky: "#C3CCFF",

  red: "#FF2301",
  green: "#459C0B",

  btcForeground: "#FB5607",
  btcBackground: "#FFD0BA",
  usdForeground: "#00A700",
  usdBackground: "#C6EBC6",

  secondary: "#FB5607",
  success: "#00A700",

  error: "#DC2626",
  error5: "#EF4444",
  error9: "#FEE2E2",
  warning: "#F59E0B",
  white: "#FFFFFF",
  black: "#000000",

  primary: "#1627C4",
  primary3: "#4453E2", // lighter than primary
  primary4: "#E6E8FA",
  primary5: "#F0F0F7",

  grey0: "#3A3C51", // grey1
  grey1: "#61637A", // grey3
  grey2: "#9292A0", // grey4
  grey3: "#AEAEB8", // grey5
  grey4: "#E6E6E8", // grey8-ish
  grey5: "#F8F8FA", // grey9

  loaderForeground: "#ecebeb",
  loaderBackground: "#f3f3f3",

  horizonBlue: {
    colors: ["#4453E2", "#5269FF"],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },

  transparent: "rgba(0, 0, 0, 0)",
}

const dark = {
  _white: "#FFFFFF",
  _black: "#000000",
  _lightGrey: "#CFD9E2",
  _lighterGrey: "#E6EBEf",
  _lightBlue: "#3553FF",
  _darkGrey: "#1d1d1d",
  _blue: "#3050C4",
  _orange: "#FF7e1c",
  _sky: "#C3CCFF",

  red: "#FF2301",
  green: "#459C0B",

  btcForeground: "#FB5607",
  btcBackground: "#FFD0BA",
  usdForeground: "#00A700",
  usdBackground: "#C6EBC6",

  secondary: "#FB5607",
  success: "#00A700",

  error: "#DC2626",
  error5: "#EF4444",
  error9: "#FEE2E2",
  warning: "#F59E0B",

  white: "#000000",
  black: "#FFFFFF",

  primary: "#6775F3",
  primary3: "#2735D3", // TODO: programmatic
  primary4: "#131F89",
  primary5: "#09125A",

  grey0: "#FAF9F9", // grey1
  grey1: "#E9E8E8", // grey2
  grey2: "#CCCCCC", // grey3
  grey3: "#949494", // grey5
  grey4: "#393939", // grey8
  grey5: "#1d1d1d", // after grey9

  loaderBackground: "#131313",
  loaderForeground: "#3c3b3b",

  horizonBlue: {
    colors: ["#4453E2", "#5269FF"],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },

  transparent: "rgba(0, 0, 0, 0)",
}

export { light, dark }
