import { useColorSchemeQuery } from "@app/graphql/generated"
import { useThemeMode, ThemeMode } from "@rneui/themed"
import { useEffect } from "react"
import { Appearance } from "react-native"

export const ThemeSyncGraphql = () => {
  const { mode, setMode } = useThemeMode()

  const data = useColorSchemeQuery()

  useEffect(() => {
    const scheme = data?.data?.colorScheme
    if (!scheme) return

    // Default scheme is system
    if (scheme === "system") {
      const systemScheme = Appearance.getColorScheme()

      // Set if System Scheme is different
      if (systemScheme !== mode) setMode(systemScheme as ThemeMode)

      // Listener for system scheme - in case OS theme is switched when the app is running
      const { remove: stopListener } = Appearance.addChangeListener(({ colorScheme }) => {
        if (!colorScheme) return
        if (colorScheme !== mode) setMode(colorScheme as ThemeMode)
      })
      return stopListener
    }

    // Set if Set theme is different (and not system)
    if (scheme !== mode) setMode(scheme as ThemeMode)

    return () => {}
  }, [data, setMode, mode])

  return null
}
