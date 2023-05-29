import { useColorSchemeQuery } from "@app/graphql/generated"
import { useThemeMode, ThemeMode } from "@rneui/themed"
import { useEffect } from "react"
import { Appearance } from "react-native"

export const ThemeSyncGraphql = () => {
  const { mode, setMode } = useThemeMode()

  const data = useColorSchemeQuery()

  useEffect(() => {
    const scheme = data?.data?.colorScheme

    if (!scheme) {
      return
    }

    const systemScheme = Appearance.getColorScheme()

    if (scheme !== mode && scheme !== "system") {
      setMode(scheme as ThemeMode)
    } else if (scheme === "system" && systemScheme !== mode) {
      setMode(systemScheme as ThemeMode)
    }

    if (scheme === "system") {
      const { remove: stopListener } = Appearance.addChangeListener(({ colorScheme }) => {
        if (!colorScheme) return
        if (colorScheme !== mode) setMode(colorScheme as ThemeMode)
      })
      return stopListener
    }

    return () => {}
  }, [data, setMode, mode])

  return null
}
