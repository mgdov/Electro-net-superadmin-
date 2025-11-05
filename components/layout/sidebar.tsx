"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Zap,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  DollarSign,
  AlertTriangle,
  LogOut,
} from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Operators", href: "/operators" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: Zap, label: "Stations", href: "/stations" },
  { icon: CreditCard, label: "Transactions", href: "/transactions" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: DollarSign, label: "Tariffs", href: "/tariffs" },
  { icon: AlertTriangle, label: "Alerts", href: "/alerts" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="bg-sidebar-primary rounded-lg p-2">
            <svg className="w-6 h-6 text-sidebar-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0m5 8h-4V4h-2v4H5v2h4v4h2v-4h4v-2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-sidebar-foreground">CSMS</h2>
            <p className="text-xs text-sidebar-accent-foreground opacity-60">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  )
}
