import { createTheme } from "@rneui/themed"
import colors from "./colors"

const theme = createTheme({
  lightColors: colors,
  darkColors: colors,
  mode: "light",
  components: {
    Button: {
      buttonStyle: {},
    },
  },
})

export default theme
