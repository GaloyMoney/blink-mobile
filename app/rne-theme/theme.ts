import { createTheme } from "@rneui/themed"
import { StyleProp, TextStyle } from "react-native"
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
    Input: {
      labelStyle: {
        fontWeight: "400",
        fontSize: 16,
        lineHeight: 24,
        color: colors.grey5,
        paddingBottom: 8,
      },
      inputStyle: {
        color: colors.grey5,
      },
      inputContainerStyle: {
        borderWidth: 1,
        borderRadius: 10,
        paddingTop: 0,
        paddingLeft: 10,
        borderColor: colors.primary8,
        shadowColor: colors.primary8,
        shadowOffset: { width: -2, height: 3 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
        elevation: -1,
      },
      errorStyle: {
        color: colors.error5,
        textTransform: "capitalize",
      },
    },
    Text: (props, theme) => {
      const universalStyle = {
        color: props.color || theme.colors.grey5,
        fontWeight: props.bold ? "600" : "400",
      }

      const sizeStyle =
        {
          h1: {
            fontSize: 24,
            lineHeight: 32,
          },
          h2: {
            fontSize: 20,
            lineHeight: 24,
          },
          p1: {
            fontSize: 18,
            lineHeight: 24,
          },
          p2: {
            fontSize: 16,
            lineHeight: 24,
            fontWeight: props.bold ? "600" : "400",
          },
          p3: {
            fontSize: 14,
            lineHeight: 18,
            fontWeight: props.bold ? "600" : "400",
          },
          p4: {
            fontSize: 12,
            lineHeight: 18,
            fontWeight: props.bold ? "600" : "400",
          },
        }[props.type] || {}

      return {
        style: {
          ...universalStyle,
          ...sizeStyle,
        } as StyleProp<TextStyle>,
      }
    },
  },
})

export default theme
