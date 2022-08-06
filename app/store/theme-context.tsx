import { createContext, useContext, useState } from "react"
import { defaultTheme, Theme } from "../theme/default-theme"

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>(undefined)
export const useThemeContext = () => useContext(ThemeContext).theme
export const useSetTheme = () => useContext(ThemeContext).setTheme

export const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  )
}
