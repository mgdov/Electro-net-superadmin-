"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Tariff {
  id: string
  name: string
  description: string
  pricePerKwh: number
  pricePerMin: number
  minCharge: number
  status: "active" | "inactive"
  usersCount: number
}

interface TariffFormData {
  name: string
  description: string
  pricePerKwh: number
  pricePerMin: number
  minCharge: number
  status: "active" | "inactive"
}

export default function TariffsPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null)
  const [formData, setFormData] = useState<TariffFormData>({
    name: "",
    description: "",
    pricePerKwh: 0,
    pricePerMin: 0,
    minCharge: 0,
    status: "active",
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchTariffs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Not authenticated")
        return
      }

      const response = await fetch("http://176.88.248.139/billing/tariffs", {
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
        throw new Error(`Failed to fetch tariffs: ${response.status}`)
      }

      const data = await response.json()
      setTariffs(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tariffs")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTariff = async () => {
    try {
      setSubmitting(true)
      const token = localStorage.getItem("adminToken")
      const response = await fetch("http://176.88.248.139/billing/tariffs", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create tariff: ${response.status}`)
      }

      await fetchTariffs()
      setIsCreateDialogOpen(false)
      setFormData({
        name: "",
        description: "",
        pricePerKwh: 0,
        pricePerMin: 0,
        minCharge: 0,
        status: "active",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tariff")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditTariff = async () => {
    if (!editingTariff) return

    try {
      setSubmitting(true)
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`http://176.88.248.139/billing/tariffs/${editingTariff.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update tariff: ${response.status}`)
      }

      await fetchTariffs()
      setIsEditDialogOpen(false)
      setEditingTariff(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tariff")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTariff = async (tariffId: string) => {
    if (!confirm("Are you sure you want to delete this tariff?")) return

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`http://176.88.248.139/billing/tariffs/${tariffId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete tariff: ${response.status}`)
      }

      await fetchTariffs()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tariff")
    }
  }

  const openEditDialog = (tariff: Tariff) => {
    setEditingTariff(tariff)
    setFormData({
      name: tariff.name,
      description: tariff.description,
      pricePerKwh: tariff.pricePerKwh,
      pricePerMin: tariff.pricePerMin,
      minCharge: tariff.minCharge,
      status: tariff.status,
    })
    setIsEditDialogOpen(true)
  }

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
          <Button onClick={fetchTariffs} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Тарифы</h1>
          <p className="text-muted-foreground mt-2">Управляйте тарифными планами и ценообразованием</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Новый тариф
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Создать новый тариф</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Название
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Описание
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pricePerKwh" className="text-right">
                  Цена за кВт·ч
                </Label>
                <Input
                  id="pricePerKwh"
                  type="number"
                  step="0.01"
                  value={formData.pricePerKwh}
                  onChange={(e) => setFormData({ ...formData, pricePerKwh: parseFloat(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pricePerMin" className="text-right">
                  Цена за минуту
                </Label>
                <Input
                  id="pricePerMin"
                  type="number"
                  step="0.01"
                  value={formData.pricePerMin}
                  onChange={(e) => setFormData({ ...formData, pricePerMin: parseFloat(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minCharge" className="text-right">
                  Мин. плата
                </Label>
                <Input
                  id="minCharge"
                  type="number"
                  step="0.01"
                  value={formData.minCharge}
                  onChange={(e) => setFormData({ ...formData, minCharge: parseFloat(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Статус
                </Label>
                <Select value={formData.status} onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активный</SelectItem>
                    <SelectItem value="inactive">Неактивный</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateTariff} disabled={submitting}>
                {submitting ? "Создание..." : "Создать"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tariffs.map((tariff) => (
          <Card key={tariff.id} className="border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{tariff.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{tariff.description}</p>
                <span
                  className={`text-xs font-medium mt-2 px-2 py-1 rounded-full inline-block ${tariff.status === "active" ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
                    }`}
                >
                  {tariff.status === "active" ? "Активный" : "Неактивный"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => openEditDialog(tariff)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteTariff(tariff.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 mt-6 border-t border-border pt-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Цена за кВт·ч</span>
                <span className="font-bold text-foreground">${tariff.pricePerKwh.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Цена за минуту</span>
                <span className="font-bold text-foreground">${tariff.pricePerMin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Минимальная плата</span>
                <span className="font-bold text-foreground">${tariff.minCharge.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs text-muted-foreground">Пользователей: {tariff.usersCount}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать тариф</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Название
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Описание
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-pricePerKwh" className="text-right">
                Цена за кВт·ч
              </Label>
              <Input
                id="edit-pricePerKwh"
                type="number"
                step="0.01"
                value={formData.pricePerKwh}
                onChange={(e) => setFormData({ ...formData, pricePerKwh: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-pricePerMin" className="text-right">
                Цена за минуту
              </Label>
              <Input
                id="edit-pricePerMin"
                type="number"
                step="0.01"
                value={formData.pricePerMin}
                onChange={(e) => setFormData({ ...formData, pricePerMin: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-minCharge" className="text-right">
                Мин. плата
              </Label>
              <Input
                id="edit-minCharge"
                type="number"
                step="0.01"
                value={formData.minCharge}
                onChange={(e) => setFormData({ ...formData, minCharge: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Статус
              </Label>
              <Select value={formData.status} onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="inactive">Неактивный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditTariff} disabled={submitting}>
              {submitting ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
