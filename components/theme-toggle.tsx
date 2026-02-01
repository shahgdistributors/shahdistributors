"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getTheme, toggleTheme } from "@/lib/theme"

export function ThemeToggle() {
  const [theme, setThemeState] = useState<string>("dark")

  useEffect(() => {
    setThemeState(getTheme())
  }, [])

  const handleToggle = () => {
    const newTheme = toggleTheme()
    setThemeState(newTheme)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="h-9 w-9"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
