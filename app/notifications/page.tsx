"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Send, Edit, Trash2, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Notification {
  id: string
  title: string
  message: string
  timestamp: string
  status: "sent" | "pending"
  recipients: number
}

interface NotificationStats {
  totalSent: number
  delivered: number
  errors: number
}

interface BroadcastFormData {
  title: string
  message: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [activeTab, setActiveTab] = useState<"sent" | "draft">("sent")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false)
  const [broadcastFormData, setBroadcastFormData] = useState<BroadcastFormData>({
    title: "",
    message: "",
  })
  const [broadcasting, setBroadcasting] = useState(false)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Not authenticated")
        return
      }

      const response = await fetch("http://176.88.248.139/notifications", {
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
        throw new Error(`Failed to fetch notifications: ${response.status}`)
      }

      const data = await response.json()
      setNotifications(data.notifications || data)
      setStats(data.stats || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const handleBroadcast = async () => {
    try {
      setBroadcasting(true)
      const token = localStorage.getItem("adminToken")
      const response = await fetch("http://176.88.248.139/notifications/send/broadcast", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(broadcastFormData),
      })

      if (!response.ok) {
        throw new Error(`Failed to send broadcast: ${response.status}`)
      }

      await fetchNotifications()
      setIsBroadcastDialogOpen(false)
      setBroadcastFormData({ title: "", message: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send broadcast")
    } finally {
      setBroadcasting(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
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
          <Button onClick={fetchNotifications} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const filteredNotifications = notifications.filter((n) =>
    activeTab === "sent" ? n.status === "sent" : n.status === "pending"
  )

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Уведомления</h1>
          <p className="text-muted-foreground mt-2">Отправляйте системные уведомления пользователям</p>
        </div>
        <Dialog open={isBroadcastDialogOpen} onOpenChange={setIsBroadcastDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Новое уведомление
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Отправить массовое уведомление</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Заголовок
                </Label>
                <Input
                  id="title"
                  value={broadcastFormData.title}
                  onChange={(e) => setBroadcastFormData({ ...broadcastFormData, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="message" className="text-right">
                  Сообщение
                </Label>
                <Textarea
                  id="message"
                  value={broadcastFormData.message}
                  onChange={(e) => setBroadcastFormData({ ...broadcastFormData, message: e.target.value })}
                  className="col-span-3"
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBroadcastDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleBroadcast} disabled={broadcasting}>
                {broadcasting ? "Отправка..." : "Отправить"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Всего отправлено</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {stats ? stats.totalSent.toLocaleString() : "1,234"}
          </p>
        </Card>
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Доставлено</p>
          <p className="text-2xl font-bold text-accent mt-2">
            {stats ? stats.delivered.toLocaleString() : "1,198"}
          </p>
        </Card>
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Ошибок</p>
          <p className="text-2xl font-bold text-destructive mt-2">
            {stats ? stats.errors.toLocaleString() : "36"}
          </p>
        </Card>
      </div>

      <Card className="border-border p-6">
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "sent" ? "default" : "ghost"}
            onClick={() => setActiveTab("sent")}
            className={activeTab === "sent" ? "bg-primary text-primary-foreground" : ""}
          >
            Отправленные
          </Button>
          <Button
            variant={activeTab === "draft" ? "default" : "ghost"}
            onClick={() => setActiveTab("draft")}
            className={activeTab === "draft" ? "bg-primary text-primary-foreground" : ""}
          >
            Черновики
          </Button>
        </div>

        <div className="space-y-3">
          {filteredNotifications.length > 0 ? filteredNotifications.map((notification) => (
            <Card key={notification.id} className="border-border p-4 hover:bg-secondary/30 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{notification.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <div className="flex gap-4 mt-3">
                    <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                    <span className="text-xs text-muted-foreground">Получателей: {notification.recipients}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${notification.status === "sent" ? "bg-accent/20 text-accent" : "bg-[#fbbf24]/20 text-[#fbbf24]"
                      }`}
                  >
                    {notification.status === "sent" ? "Отправлено" : "Ожидается"}
                  </span>
                  {activeTab === "draft" && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )) : (
            <div className="text-center py-8 text-muted-foreground">
              {activeTab === "sent" ? "Нет отправленных уведомлений" : "Нет черновиков"}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
