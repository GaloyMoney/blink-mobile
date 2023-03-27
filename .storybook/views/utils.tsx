import { useThemeMode } from "@rneui/themed"
import React from "react"

export const SetDarkMode: React.FC = () => {
    const { mode, setMode } = useThemeMode()
    React.useEffect(() => {
      console.log("mode", mode)
      if (mode === "dark") return
      setMode("dark")
    }, [setMode, mode])
    return null
  }

export const SetLightkMode: React.FC = () => {
    const { mode, setMode } = useThemeMode()
    React.useEffect(() => {
      console.log("mode", mode)
      if (mode === "light") return
      setMode("light")
    }, [setMode, mode])
    return null
  }