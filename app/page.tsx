"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import LoginForm from "@/components/auth/login-form"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff } from "lucide-react"
import { useWebSocket } from "@/hooks/use-websocket"

function WebSocketTest() {
  const { isConnected, reconnect } = useWebSocket("ws://176.88.248.139/ws/")

  return (
    <Card className="p-4 border-border max-w-md mx-auto mt-4">
      <h3 className="text-lg font-semibold mb-2 text-foreground">WebSocket Test</h3>
      <div className="flex items-center gap-2 mb-4">
        {isConnected ? (
          <Wifi className="w-5 h-5 text-green-500" />
        ) : (
          <WifiOff className="w-5 h-5 text-red-500" />
        )}
        <span className="text-sm text-muted-foreground">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
      <Button onClick={reconnect} variant="outline" size="sm" className="w-full">
        Test Connection
      </Button>
    </Card>
  )
}

export default function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (token) {
      router.replace("/dashboard")
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      <LoginForm />
      <WebSocketTest />
    </div>
  )
}
