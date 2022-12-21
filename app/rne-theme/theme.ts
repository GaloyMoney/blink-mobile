import { createTheme } from "@rneui/themed"
import colors from "./colors"

const theme = createTheme({
  lightColors: colors,
  darkColors: colors,
  mode: "light",
  components: {
    Button: {
      containerStyle: {
        borderRadius: 50,
        height: 40,
      },
      buttonStyle: {
        paddingHorizontal: 32,
        paddingVertical: 8,
        borderRadius: 50,
        height: 40,
      },
    },
  },
})

export default theme
