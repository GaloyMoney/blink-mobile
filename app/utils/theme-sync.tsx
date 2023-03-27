import { useDarkMode } from "@app/hooks/use-darkmode"
import { useThemeMode, ThemeMode } from "@rneui/themed"
import React from "react"
import { Appearance } from "react-native"

export const ThemeSync = () => {
  const isDarkMode = useDarkMode()
  const { mode, setMode } = useThemeMode()

  React.useEffect(() => {
    const intendedMode = isDarkMode ? "dark" : "light"

    if (intendedMode !== mode) {
      setMode(intendedMode)
    }
  }, [mode, setMode, isDarkMode])

  React.useEffect(() => {
    const res = Appearance.addChangeListener(({ colorScheme }) => {
      if (mode === colorScheme) {
        return
      }

      if (colorScheme === null || colorScheme === undefined) {
        setMode("dark")
      }

      setMode(colorScheme as ThemeMode) // TODO: not do casting?
    })

    return res.remove
  }, [mode, setMode])

  return null
}
