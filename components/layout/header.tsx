"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search, Settings, User, Wifi, WifiOff } from "lucide-react"
import { useWebSocket } from "@/hooks/use-websocket"

interface UserData {
  id: string
  email: string
  name: string
  role: string
}

export function Header() {
  const [user, setUser] = useState<UserData | null>(null)
  const { isConnected, reconnect } = useWebSocket("ws://176.88.248.139/ws/")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("[v0] Failed to parse user data:", error)
        setUser(null)
      }
    }
  }, [])

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
      <div className="flex items-center flex-1 gap-4 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* WebSocket Status Indicator */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={reconnect}
            className={`flex items-center gap-2 ${isConnected
              ? "text-accent hover:text-accent/80"
              : "text-destructive hover:text-destructive/80"
              }`}
          >
            {isConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="text-xs">
              {isConnected ? "WS Online" : "WS Offline"}
            </span>
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary">
          <Bell className="w-5 h-5" />
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary">
          <Settings className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user?.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground">{user?.role || "Super Admin"}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      </div>
    </header>
  )
}
