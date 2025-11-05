"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Search, Eye, MapPin, Play, Square, RotateCcw, Unlock, Upload, Activity, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"

interface Station {
  id: string
  name: string
  location: string
  operatorId: string
  status: "Available" | "Occupied" | "Unavailable" | "Faulted"
  power: number
  connectors: number
  siteId: string
}

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchStations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Not authenticated")
        return
      }

      const response = await fetch("http://176.88.248.139/stations", {
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
        throw new Error(`Failed to fetch stations: ${response.status}`)
      }

      const data = await response.json()
      setStations(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stations")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoteStart = async (stationId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`http://176.88.248.139/stations/${stationId}/remote-start`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectorId: 1 }), // Default connector
      })

      if (!response.ok) {
        throw new Error(`Failed to start charging: ${response.status}`)
      }

      alert("Charging started successfully")
      await fetchStations()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start charging")
    }
  }

  const handleRemoteStop = async (stationId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`http://176.88.248.139/stations/${stationId}/remote-stop`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactionId: "current" }), // Assuming current transaction
      })

      if (!response.ok) {
        throw new Error(`Failed to stop charging: ${response.status}`)
      }

      alert("Charging stopped successfully")
      await fetchStations()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop charging")
    }
  }

  const handleReset = async (stationId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`http://176.88.248.139/stations/${stationId}/reset`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "Soft" }), // Soft reset
      })

      if (!response.ok) {
        throw new Error(`Failed to reset station: ${response.status}`)
      }

      alert("Station reset successfully")
      await fetchStations()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset station")
    }
  }

  const handleChangeAvailability = async (stationId: string, available: boolean) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`http://176.88.248.139/stations/${stationId}/change-availability`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ available }),
      })

      if (!response.ok) {
        throw new Error(`Failed to change availability: ${response.status}`)
      }

      alert(`Station ${available ? "made available" : "made unavailable"}`)
      await fetchStations()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change availability")
    }
  }

  const handleUnlockConnector = async (stationId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`http://176.88.248.139/stations/${stationId}/unlock-connector`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectorId: 1 }),
      })

      if (!response.ok) {
        throw new Error(`Failed to unlock connector: ${response.status}`)
      }

      alert("Connector unlocked successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock connector")
    }
  }

  const handleUpdateFirmware = async (stationId: string) => {
    const location = prompt("Enter firmware location URL:")
    if (!location) return

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`http://176.88.248.139/stations/${stationId}/update-firmware`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location,
          retrieveDate: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update firmware: ${response.status}`)
      }

      alert("Firmware update initiated")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update firmware")
    }
  }

  const handleGetDiagnostics = async (stationId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`http://176.88.248.139/stations/${stationId}/get-diagnostics`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get diagnostics: ${response.status}`)
      }

      const data = await response.json()
      alert(`Diagnostics: ${JSON.stringify(data, null, 2)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get diagnostics")
    }
  }

  const handleDeleteStation = async (stationId: string) => {
    if (!confirm("Are you sure you want to delete this station?")) return

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`http://176.88.248.139/stations/${stationId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete station: ${response.status}`)
      }

      await fetchStations()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete station")
    }
  }

  useEffect(() => {
    fetchStations()
  }, [])

  const filteredStations = stations.filter(station =>
    station.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const onlineStations = stations.filter(s => s.status === "Available").length
  const maintenanceStations = stations.filter(s => s.status === "Unavailable").length
  const offlineStations = stations.filter(s => s.status === "Faulted").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-accent/20 text-accent"
      case "Occupied": return "bg-blue-500/20 text-blue-500"
      case "Unavailable": return "bg-[#fbbf24]/20 text-[#fbbf24]"
      case "Faulted": return "bg-destructive/20 text-destructive"
      default: return "bg-muted/20 text-muted-foreground"
    }
  }

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-accent"
      case "Occupied": return "bg-blue-500"
      case "Unavailable": return "bg-[#fbbf24]"
      case "Faulted": return "bg-destructive"
      default: return "bg-muted-foreground"
    }
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
          <Button onClick={fetchStations} className="mt-4">
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
          <h1 className="text-3xl font-bold text-foreground">Станции</h1>
          <p className="text-muted-foreground mt-2">Управляйте зарядными станциями</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Добавить станцию
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Всего станций</p>
          <p className="text-2xl font-bold text-foreground mt-2">{stations.length}</p>
        </Card>
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Available</p>
          <p className="text-2xl font-bold text-accent mt-2">{onlineStations}</p>
        </Card>
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Unavailable</p>
          <p className="text-2xl font-bold text-[#f59e0b] mt-2">{maintenanceStations}</p>
        </Card>
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Faulted</p>
          <p className="text-2xl font-bold text-destructive mt-2">{offlineStations}</p>
        </Card>
      </div>

      <Card className="border-border p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск станций..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary border-border text-foreground"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">ID</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Локация</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Оператор</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Мощность</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Розетки</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Статус</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredStations.map((station) => (
                <tr key={station.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-4 text-foreground text-sm font-medium">{station.id}</td>
                  <td className="py-3 px-4 text-foreground text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {station.location}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{station.operatorId}</td>
                  <td className="py-3 px-4 text-foreground text-sm">{station.power}kW</td>
                  <td className="py-3 px-4 text-foreground text-sm">{station.connectors}</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(station.status)}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(station.status)}`}></span>
                      {station.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-1 flex-wrap">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" title="View">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-accent hover:bg-accent/10" title="Start Charging" onClick={() => handleRemoteStart(station.id)}>
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" title="Stop Charging" onClick={() => handleRemoteStop(station.id)}>
                        <Square className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-500/10" title="Reset" onClick={() => handleReset(station.id)}>
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-green-500 hover:bg-green-500/10" title="Unlock Connector" onClick={() => handleUnlockConnector(station.id)}>
                        <Unlock className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-purple-500 hover:bg-purple-500/10" title="Update Firmware" onClick={() => handleUpdateFirmware(station.id)}>
                        <Upload className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-orange-500 hover:bg-orange-500/10" title="Get Diagnostics" onClick={() => handleGetDiagnostics(station.id)}>
                        <Activity className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" title="Delete" onClick={() => handleDeleteStation(station.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
