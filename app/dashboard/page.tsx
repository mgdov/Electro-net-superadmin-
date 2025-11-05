"use client"

import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, Users, Zap, DollarSign, AlertCircle, Activity } from "lucide-react"
import { WebSocketMonitor } from "@/components/websocket-monitor"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { useStations, useTransactions, useTransactionStats } from "@/hooks/use-api"

export default function DashboardPage() {
  const { stations, loading: stationsLoading, error: stationsError } = useStations()
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions(10)
  const { stats: transactionStats, loading: statsLoading, error: statsError } = useTransactionStats()

  // Calculate station status distribution
  const stationStatus = stations.reduce((acc, station) => {
    const status = station.status
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const stationStatusData = Object.entries(stationStatus).map(([name, value]) => ({
    name,
    value,
    color: name === 'Available' ? '#22c55e' : name === 'Occupied' ? '#f59e0b' : '#ef4444'
  }))

  // Prepare chart data from transactions
  const chartData = transactions.slice(0, 6).map((transaction, index) => ({
    month: new Date(transaction.createdAt).toLocaleDateString('en-US', { month: 'short' }),
    revenue: transaction.amount,
    transactions: 1,
    users: Math.floor(Math.random() * 50) + 20 // Mock user data
  }))

  const stats = [
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      label: "Active Stations",
      value: stations.filter(s => s.status === 'Available').length.toString(),
      change: "+12%"
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      label: "Total Users",
      value: transactionStats ? Math.floor(transactionStats.totalTransactions / 10).toString() : "0",
      change: "+5%"
    },
    {
      icon: <DollarSign className="w-6 h-6 text-primary" />,
      label: "Revenue",
      value: transactionStats ? `$${transactionStats.totalAmount.toFixed(0)}` : "$0",
      change: "+23%"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-primary" />,
      label: "Transactions",
      value: transactionStats ? transactionStats.totalTransactions.toString() : "0",
      change: "+18%"
    },
  ]

  if (stationsLoading || transactionsLoading || statsLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  if (stationsError || transactionsError || statsError) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 max-w-md">
            <p className="text-destructive mb-4">Ошибка загрузки данных</p>
            <p className="text-sm text-muted-foreground">
              {stationsError || transactionsError || statsError}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Generate alerts from station data
  const alerts = stations
    .filter(station => station.status === 'Faulted' || station.status === 'Unavailable')
    .slice(0, 3)
    .map((station, index) => ({
      id: station.id,
      title: station.status === 'Faulted'
        ? `Fault at ${station.name}`
        : `Station ${station.name} unavailable`,
      severity: station.status === 'Faulted' ? "critical" : "warning",
      time: "Recently"
    }))

  // Add default alerts if no real issues
  if (alerts.length === 0) {
    alerts.push(
      { id: "default", title: "All stations operating normally", severity: "info", time: "Now" }
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Панель управления</h1>
        <p className="text-muted-foreground mt-2">Добро пожаловать! Вот обзор вашей системы.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Доход и транзакции" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
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
              <Bar dataKey="revenue" fill="var(--color-chart-1)" />
              <Bar dataKey="transactions" fill="var(--color-chart-2)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Статус станций">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stationStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {stationStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* User Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Активность пользователей" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <Line type="monotone" dataKey="users" stroke="var(--color-accent)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Недавние оповещения
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="pb-3 border-b border-border last:border-0">
                <p className="text-sm font-medium text-foreground">{alert.title}</p>
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${alert.severity === "critical"
                      ? "bg-destructive/20 text-destructive"
                      : alert.severity === "warning"
                        ? "bg-[#fbbf24]/20 text-[#fbbf24]"
                        : "bg-accent/20 text-accent"
                      }`}
                  >
                    {alert.severity === "critical"
                      ? "Критический"
                      : alert.severity === "warning"
                        ? "Предупреждение"
                        : "Информация"}
                  </span>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card className="border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Последние транзакции
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">ID</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Пользователь</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Станция</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Сумма</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Статус</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-4 text-foreground text-sm font-medium">{transaction.id.substring(0, 8)}...</td>
                  <td className="py-3 px-4 text-foreground text-sm">{transaction.userId.substring(0, 8)}...</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{transaction.stationId.substring(0, 8)}...</td>
                  <td className="py-3 px-4 text-foreground text-sm font-medium">${transaction.amount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed'
                        ? 'bg-green-500/20 text-green-600'
                        : transaction.status === 'active'
                          ? 'bg-blue-500/20 text-blue-600'
                          : transaction.status === 'failed'
                            ? 'bg-red-500/20 text-red-600'
                            : 'bg-yellow-500/20 text-yellow-600'
                      }`}>
                      {transaction.status === 'completed' ? 'Завершено' :
                        transaction.status === 'active' ? 'Активно' :
                          transaction.status === 'failed' ? 'Ошибка' : 'Остановлено'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* WebSocket Monitor */}
      <WebSocketMonitor />
    </div>
  )
}
