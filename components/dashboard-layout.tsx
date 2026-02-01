"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AppSidebar } from "./app-sidebar"
import { isAuthenticated } from "@/lib/auth"
import { ThemeToggle } from "./theme-toggle"
import { initializeTheme } from "@/lib/theme"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    initializeTheme()

    if (!isAuthenticated() && pathname !== "/login") {
      router.push("/login")
    }
  }, [pathname, router])

  if (!isAuthenticated()) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-end gap-4 border-b bg-card px-6">
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  )
}
