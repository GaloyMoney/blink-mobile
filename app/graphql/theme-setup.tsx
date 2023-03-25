import { useThemeMode } from "@rneui/themed"
import React from "react"
import { Appearance } from "react-native"
import { useDarkModeQuery } from "./generated"

export const ThemeSync = () => {
  const { mode, setMode } = useThemeMode()
  const { data } = useDarkModeQuery()
  const darkMode = data?.darkMode

  React.useEffect(() => {
    if (darkMode === undefined || darkMode === "system") {
      if (mode !== Appearance.getColorScheme()) {
        Appearance.getColorScheme() === "dark" ? setMode("dark") : setMode("light")
      }
    } else if (darkMode === "dark") {
      if (mode !== "dark") {
        setMode("dark")
      }
    } else if (darkMode === "light") {
      if (mode !== "light") {
        setMode("light")
      }
    }
  }, [darkMode, mode, setMode])

  React.useEffect(() => {
    const res = Appearance.addChangeListener(({ colorScheme }) => {
      if (darkMode === undefined || darkMode === "system") {
        if (mode !== colorScheme) {
          colorScheme === "dark" ? setMode("dark") : setMode("light")
        }
      }
    })

    return res.remove
  }, [darkMode, mode, setMode])

  return null
}
