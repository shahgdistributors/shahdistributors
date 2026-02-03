"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AppSidebar } from "./app-sidebar"
import { isAuthenticated } from "@/lib/auth"
import { ThemeToggle } from "./theme-toggle"
import { initializeTheme } from "@/lib/theme"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0">
          <AppSidebar />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  )
}
