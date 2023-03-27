import { Appearance } from "react-native"

export const useDarkMode = () => {
  return Appearance.getColorScheme() !== "light"
}
