"use client"

import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useState, useEffect } from "react"

interface DashboardMetrics {
  averageSessionDuration: number
  successRate: number
  peakLoad: number
  costPerTransaction: number
  sessionDurationChange: number
  successRateChange: number
  peakLoadChange: number
  costPerTransactionChange: number
}

interface RevenueData {
  date: string
  revenue: number
  users: number
  transactions: number
}

interface StationPerformance {
  station: string
  revenue: number
  utilization: number
  efficiency: number
}

export default function AnalyticsPage() {
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [stationPerformance, setStationPerformance] = useState<StationPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardMetrics = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Not authenticated")
        return
      }

      const response = await fetch("http://176.88.248.139/analytics/dashboard", {
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
        throw new Error(`Failed to fetch dashboard metrics: ${response.status}`)
      }

      const data = await response.json()
      setDashboardMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard metrics")
    }
  }

  const fetchRevenueData = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("http://176.88.248.139/analytics/revenue", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // If revenue endpoint doesn't exist, use dashboard data or skip
        console.warn("Revenue endpoint not available, using default data")
        return
      }

      const data = await response.json()
      setRevenueData(data)
    } catch (err) {
      console.warn("Failed to load revenue data:", err)
      // Keep default data if API fails
    }
  }

  const fetchStationPerformance = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("http://176.88.248.139/analytics/stations", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch station performance: ${response.status}`)
      }

      const data = await response.json()
      setStationPerformance(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load station performance")
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    await Promise.all([
      fetchDashboardMetrics(),
      fetchRevenueData(),
      fetchStationPerformance(),
    ])
    setLoading(false)
  }

  useEffect(() => {
    fetchAllData()
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
          <button onClick={fetchAllData} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded">
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Default data if API doesn't provide revenue data
  const defaultRevenueData = [
    { date: "1 Jan", revenue: 2400, users: 240, transactions: 120 },
    { date: "5 Jan", revenue: 3210, users: 221, transactions: 145 },
    { date: "10 Jan", revenue: 2290, users: 229, transactions: 110 },
    { date: "15 Jan", revenue: 2000, users: 200, transactions: 95 },
    { date: "20 Jan", revenue: 2181, users: 220, transactions: 130 },
    { date: "25 Jan", revenue: 2500, users: 250, transactions: 155 },
    { date: "30 Jan", revenue: 2100, users: 210, transactions: 118 },
  ]

  const displayRevenueData = revenueData.length > 0 ? revenueData : defaultRevenueData

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Аналитика</h1>
        <p className="text-muted-foreground mt-2">Анализ производительности системы и метрики</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Средняя длительность сеанса</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {dashboardMetrics ? `${Math.floor(dashboardMetrics.averageSessionDuration / 60)}м ${dashboardMetrics.averageSessionDuration % 60}с` : "52м 18с"}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <p className="text-accent text-xs mt-2">
            {dashboardMetrics ? `+${dashboardMetrics.sessionDurationChange.toFixed(1)}%` : "+4.3%"} от прошлого месяца
          </p>
        </Card>
        <Card className="border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Уровень успеха</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {dashboardMetrics ? `${dashboardMetrics.successRate.toFixed(1)}%` : "98.2%"}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <p className="text-accent text-xs mt-2">
            {dashboardMetrics ? `+${dashboardMetrics.successRateChange.toFixed(1)}%` : "+1.2%"} от прошлого месяца
          </p>
        </Card>
        <Card className="border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Пиковая нагрузка</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {dashboardMetrics ? `${dashboardMetrics.peakLoad.toFixed(1)} MW` : "2.4 MW"}
              </p>
            </div>
            <TrendingDown className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-destructive text-xs mt-2">
            {dashboardMetrics ? `${dashboardMetrics.peakLoadChange > 0 ? '+' : ''}${dashboardMetrics.peakLoadChange.toFixed(1)}%` : "-5%"} от прошлого месяца
          </p>
        </Card>
        <Card className="border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Стоимость за транзакцию</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {dashboardMetrics ? `$${dashboardMetrics.costPerTransaction.toFixed(2)}` : "$0.18"}
              </p>
            </div>
            <TrendingDown className="w-5 h-5 text-accent" />
          </div>
          <p className="text-accent text-xs mt-2">
            {dashboardMetrics ? `${dashboardMetrics.costPerTransactionChange > 0 ? '+' : ''}${dashboardMetrics.costPerTransactionChange.toFixed(1)}%` : "-2.1%"} от прошлого месяца
          </p>
        </Card>
      </div>

      <Card className="border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Тренд доходов</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={displayRevenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "var(--color-foreground)" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-primary)"
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Активность пользователей</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={displayRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="var(--color-accent)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Количество транзакций</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <Bar dataKey="transactions" fill="var(--color-chart-2)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Производительность станций</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Станция</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Доход</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Использование</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Эффективность</th>
              </tr>
            </thead>
            <tbody>
              {stationPerformance.length > 0 ? stationPerformance.map((station) => (
                <tr key={station.station} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-4 text-foreground text-sm font-medium">{station.station}</td>
                  <td className="py-3 px-4 text-foreground text-sm font-medium">${station.revenue}</td>
                  <td className="py-3 px-4 text-foreground text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${station.utilization}%` }}></div>
                      </div>
                      {station.utilization}%
                    </div>
                  </td>
                  <td className="py-3 px-4 text-foreground text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${station.efficiency}%` }}></div>
                      </div>
                      {station.efficiency}%
                    </div>
                  </td>
                </tr>
              )) : (
                // Default data if API fails
                [
                  { station: "ST-001", revenue: 4200, utilization: 85, efficiency: 92 },
                  { station: "ST-002", revenue: 5600, utilization: 92, efficiency: 95 },
                  { station: "ST-003", revenue: 3200, utilization: 65, efficiency: 78 },
                  { station: "ST-004", revenue: 4800, utilization: 88, efficiency: 90 },
                ].map((station) => (
                  <tr key={station.station} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-4 text-foreground text-sm font-medium">{station.station}</td>
                    <td className="py-3 px-4 text-foreground text-sm font-medium">${station.revenue}</td>
                    <td className="py-3 px-4 text-foreground text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${station.utilization}%` }}></div>
                        </div>
                        {station.utilization}%
                      </div>
                    </td>
                    <td className="py-3 px-4 text-foreground text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${station.efficiency}%` }}></div>
                        </div>
                        {station.efficiency}%
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
