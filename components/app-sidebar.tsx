"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Warehouse,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { logout, getCurrentUser } from "@/lib/auth"
import Image from "next/image"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: CreditCard, label: "POS", href: "/pos" },
  { icon: Package, label: "Products", href: "/products" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: Users, label: "Distributors", href: "/distributors" },
  { icon: ShoppingCart, label: "Sales & Orders", href: "/sales" },
  { icon: FileText, label: "Daily Sales", href: "/daily-sales" },
  { icon: Warehouse, label: "Inventory", href: "/inventory" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: FileText, label: "Export Data", href: "/export-data" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const user = getCurrentUser()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center">
            <Image
              src="/images/9515d28e-1e5d-43a0-b693-b831d02b83eb-removalai-preview.png"
              alt="Shah Distributors"
              width={260}
              height={80}
              className="object-contain h-[72px] w-auto"
              priority
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2">
            <div className="text-sm font-medium text-sidebar-foreground">{user.fullName}</div>
            <div className="text-xs text-sidebar-foreground/60">{user.role}</div>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent gap-3",
            collapsed && "justify-center",
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}
