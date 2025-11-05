"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, RefreshCw, Database, Shield, Zap } from "lucide-react"
import { useState, useEffect } from "react"

interface SystemSettings {
  systemName: string
  apiEndpoint: string
  supportEmail: string
  supportPhone: string
  authApiPort: number
  stationsApiPort: number
  websocketPort: number
  ocppPort: number
  dbHost: string
  dbPort: number
  dbName: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Not authenticated")
        return
      }

      const response = await fetch("http://176.88.248.139/system/settings", {
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
        throw new Error(`Failed to fetch settings: ${response.status}`)
      }

      const data = await response.json()
      setSettings(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      const token = localStorage.getItem("adminToken")
      const response = await fetch("http://176.88.248.139/system/settings", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status}`)
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof SystemSettings, value: string | number) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  useEffect(() => {
    fetchSettings()
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
          <Button onClick={fetchSettings} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-8 space-y-8">
        <div className="text-center">
          <p className="text-muted-foreground">No settings data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Настройки</h1>
        <p className="text-muted-foreground mt-2">Управляйте конфигурацией системы и параметрами</p>
      </div>

      {saved && (
        <Card className="border-accent/30 bg-accent/10 p-4">
          <p className="text-accent font-medium">Настройки успешно сохранены</p>
        </Card>
      )}

      <Card className="border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Общие настройки</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="systemName" className="text-sm font-medium text-foreground">Название системы</Label>
            <Input
              id="systemName"
              value={settings.systemName}
              onChange={(e) => handleInputChange("systemName", e.target.value)}
              className="bg-secondary border-border text-foreground mt-1"
            />
          </div>
          <div>
            <Label htmlFor="apiEndpoint" className="text-sm font-medium text-foreground">API Endpoint</Label>
            <Input
              id="apiEndpoint"
              value={settings.apiEndpoint}
              onChange={(e) => handleInputChange("apiEndpoint", e.target.value)}
              className="bg-secondary border-border text-foreground mt-1"
            />
          </div>
          <div>
            <Label htmlFor="supportEmail" className="text-sm font-medium text-foreground">Email поддержки</Label>
            <Input
              id="supportEmail"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => handleInputChange("supportEmail", e.target.value)}
              className="bg-secondary border-border text-foreground mt-1"
            />
          </div>
          <div>
            <Label htmlFor="supportPhone" className="text-sm font-medium text-foreground">Телефон поддержки</Label>
            <Input
              id="supportPhone"
              value={settings.supportPhone}
              onChange={(e) => handleInputChange("supportPhone", e.target.value)}
              className="bg-secondary border-border text-foreground mt-1"
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </Card>

      <Card className="border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">API конфигурация</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="authApiPort" className="text-sm font-medium text-foreground">Auth API Port</Label>
            <Input
              id="authApiPort"
              type="number"
              value={settings.authApiPort}
              onChange={(e) => handleInputChange("authApiPort", parseInt(e.target.value))}
              className="bg-secondary border-border text-foreground mt-1"
            />
          </div>
          <div>
            <Label htmlFor="stationsApiPort" className="text-sm font-medium text-foreground">Stations API Port</Label>
            <Input
              id="stationsApiPort"
              type="number"
              value={settings.stationsApiPort}
              onChange={(e) => handleInputChange("stationsApiPort", parseInt(e.target.value))}
              className="bg-secondary border-border text-foreground mt-1"
            />
          </div>
          <div>
            <Label htmlFor="websocketPort" className="text-sm font-medium text-foreground">WebSocket Port</Label>
            <Input
              id="websocketPort"
              type="number"
              value={settings.websocketPort}
              onChange={(e) => handleInputChange("websocketPort", parseInt(e.target.value))}
              className="bg-secondary border-border text-foreground mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ocppPort" className="text-sm font-medium text-foreground">OCPP Protocol Port</Label>
            <Input
              id="ocppPort"
              type="number"
              value={settings.ocppPort}
              onChange={(e) => handleInputChange("ocppPort", parseInt(e.target.value))}
              className="bg-secondary border-border text-foreground mt-1"
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Сохранение..." : "Сохранить конфигурацию"}
        </Button>
      </Card>

      <Card className="border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Параметры базы данных</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="dbHost" className="text-sm font-medium text-foreground">БД Хост</Label>
            <Input
              id="dbHost"
              value={settings.dbHost}
              onChange={(e) => handleInputChange("dbHost", e.target.value)}
              className="bg-secondary border-border text-foreground mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dbPort" className="text-sm font-medium text-foreground">БД Порт</Label>
            <Input
              id="dbPort"
              type="number"
              value={settings.dbPort}
              onChange={(e) => handleInputChange("dbPort", parseInt(e.target.value))}
              className="bg-secondary border-border text-foreground mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dbName" className="text-sm font-medium text-foreground">БД Название</Label>
            <Input
              id="dbName"
              value={settings.dbName}
              onChange={(e) => handleInputChange("dbName", e.target.value)}
              className="bg-secondary border-border text-foreground mt-1"
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Сохранение..." : "Сохранить"}
        </Button>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Опасные операции</h2>
        <div className="space-y-3">
          <Button variant="outline" className="w-full border-border text-foreground hover:bg-secondary bg-transparent">
            <RefreshCw className="w-4 h-4 mr-2" />
            Перезагрузить кеш
          </Button>
          <Button className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Очистить все логи
          </Button>
          <Button className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Сбросить все настройки до стандартных
          </Button>
        </div>
      </Card>
    </div>
  )
}
