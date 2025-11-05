"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, AlertCircle, CheckCircle, X, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"

interface Alert {
  id: string
  type: "critical" | "warning" | "info"
  title: string
  station: string
  time: string
  description: string
  timestamp: string
}

interface AlertStats {
  critical: number
  warning: number
  info: number
  total: number
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState<AlertStats | null>(null)
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Not authenticated")
        return
      }

      const response = await fetch("http://176.88.248.139/alerts", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized")
          return
        }
        if (response.status === 403) {
          setError("Access denied")
          return
        }
        throw new Error(`Failed to fetch alerts: ${response.status}`)
      }

      const data = await response.json()
      setAlerts(data.alerts || data)
      setStats(data.stats || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts")
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = (id: string) => {
    setDismissedAlerts([...dismissedAlerts, id])
  }

  const filteredAlerts = alerts.filter((alert) => !dismissedAlerts.includes(alert.id))

  useEffect(() => {
    fetchAlerts()
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 space-y-8">
        <div className="text-center">
          <p className="text-destructive text-lg">{error}</p>
          <Button onClick={fetchAlerts} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Алерты</h1>
        <p className="text-muted-foreground mt-2">Системные алерты и уведомления</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Критические алерты</p>
          <p className="text-2xl font-bold text-destructive mt-2">
            {stats ? stats.critical : filteredAlerts.filter((a) => a.type === "critical").length}
          </p>
        </Card>
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Предупреждения</p>
          <p className="text-2xl font-bold text-[#fbbf24] mt-2">
            {stats ? stats.warning : filteredAlerts.filter((a) => a.type === "warning").length}
          </p>
        </Card>
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Информация</p>
          <p className="text-2xl font-bold text-accent mt-2">
            {stats ? stats.info : filteredAlerts.filter((a) => a.type === "info").length}
          </p>
        </Card>
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Всех алертов</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {stats ? stats.total : filteredAlerts.length}
          </p>
        </Card>
      </div>

      <div className="space-y-3">
        {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => {
          const Icon = alert.type === "critical" ? AlertTriangle : alert.type === "warning" ? AlertCircle : CheckCircle
          const bgColor =
            alert.type === "critical"
              ? "bg-destructive/10"
              : alert.type === "warning"
                ? "bg-[#fbbf24]/10"
                : "bg-accent/10"
          const borderColor =
            alert.type === "critical"
              ? "border-destructive/30"
              : alert.type === "warning"
                ? "border-[#fbbf24]/30"
                : "border-accent/30"
          const iconColor =
            alert.type === "critical" ? "text-destructive" : alert.type === "warning" ? "text-[#fbbf24]" : "text-accent"

          return (
            <Card key={alert.id} className={`border ${borderColor} ${bgColor} p-4`}>
              <div className="flex gap-4 items-start">
                <Icon className={`w-5 h-5 ${iconColor} shrink-0 mt-1`} />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{alert.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{alert.station}</p>
                  <p className="text-xs text-muted-foreground mt-2">{alert.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDismiss(alert.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        }) : (
          <div className="text-center py-8 text-muted-foreground">
            Нет активных алертов
          </div>
        )}
      </div>
    </div>
  )
}
