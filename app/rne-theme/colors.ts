const light = {
  red: "#FF2301",
  green: "#459C0B",
  transparent: "rgba(0, 0, 0, 0)",

  _white: "#FFFFFF",
  _black: "#000000",
  _lightGrey: "#CFD9E2",
  _lighterGrey: "#E6EBEf",
  _lightBlue: "#3553FF",
  _darkGrey: "#1d1d1d",
  _blue: "#3050C4",
  _orange: "#FF7e1c",
  _sky: "#C3CCFF",

  btcPrimary: "#8c540a",
  usdPrimary: "#40632c",

  backgroundPrimary5: "rgba(240, 240, 247, 0.8)",
  secondary: "#FB5607",
  secondary5: "#FB5607",
  secondary8: "#FFD0BA",
  success: "#00A700",
  success5: "#00A700",
  success9: "#C6EBC6",
  error: "#DC2626",
  error5: "#EF4444",
  error9: "#FEE2E2",
  warning: "#F59E0B",
  warning4: "#F59E0B",
  warning9: "#FEF3C7",
  white: "#FFFFFF",
  black: "#000000",

  primary: "#1627C4",
  primary1: "#131F89",
  primary3: "#4453E2",
  primary4: "#E6E8FA",
  primary5: "#F0F0F7",

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

  // legacy
  loaderForeground: "#ecebeb",
  loaderBackground: "#f3f3f3",
}

const dark = {
  red: "#FF2301",
  green: "#459C0B",
  transparent: "rgba(0, 0, 0, 0)",

  _white: "#FFFFFF",
  _black: "#000000",
  _lightGrey: "#CFD9E2",
  _lighterGrey: "#E6EBEf",
  _lightBlue: "#3553FF",
  _darkGrey: "#1d1d1d",
  _blue: "#3050C4",
  _orange: "#FF7e1c",
  _sky: "#C3CCFF",

  btcPrimary: "#8c540a",
  usdPrimary: "#40632c",

  backgroundPrimary5: "rgba(97, 99, 122, 0.8)",
  secondary: "#FB5607",
  secondary5: "#FB5607",
  secondary8: "#FFD0BA",
  success: "#00A700",
  success5: "#00A700",
  success9: "#C6EBC6",
  error: "#DC2626",
  error5: "#EF4444",
  error9: "#FEE2E2",
  warning: "#F59E0B",
  warning4: "#F59E0B",
  warning9: "#FEF3C7",

  white: "#000000", // <-- this is the only change
  black: "#FFFFFF", // <-- this is the only change

  primary: "#6775F3",
  primary1: "#CACFFD",
  primary3: "#1627C5",
  primary4: "#131F89",
  primary5: "#09125A",

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

  // legacy
  loaderBackground: "#131313",
  loaderForeground: "#3c3b3b",
}

export { light, dark }
