"use client"

// Theme management utility
const getStoredTheme = () => {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return null
  try {
    return localStorage.getItem("dms_theme")
  } catch {
    return null
  }
}

const setStoredTheme = (theme: string) => {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return
  try {
    localStorage.setItem("dms_theme", theme)
  } catch {
    // Ignore storage errors to keep theme toggling usable.
  }
}

export function getTheme(): string {
  return getStoredTheme() || "dark"
}

export function setTheme(theme: string): void {
  if (typeof window === "undefined") return
  setStoredTheme(theme)

  if (theme === "dark") {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
}

export function toggleTheme(): string {
  const currentTheme = getTheme()
  const newTheme = currentTheme === "dark" ? "light" : "dark"
  setTheme(newTheme)
  return newTheme
}

export function initializeTheme(): void {
  const theme = getTheme()
  setTheme(theme)
}
