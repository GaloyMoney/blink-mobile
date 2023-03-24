import { useDarkModeQuery } from "@app/graphql/generated"
import { Appearance } from "react-native"

export const useDarkMode = () => {
  const { data } = useDarkModeQuery()
  if (data?.darkMode === undefined || data?.darkMode === "system") {
    return Appearance.getColorScheme() !== "light"
  }

  return data?.darkMode === "dark"
}
