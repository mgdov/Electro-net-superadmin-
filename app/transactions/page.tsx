"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"

interface Transaction {
  id: string
  user: string
  station: string
  amount: number
  duration: number
  status: "completed" | "failed" | "pending"
  timestamp: string
}

interface TransactionStats {
  totalRevenue: number
  monthlyRevenue: number
  totalTransactions: number
  averageTransaction: number
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Not authenticated")
        return
      }

      const response = await fetch("http://176.88.248.139/transactions", {
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
        throw new Error(`Failed to fetch transactions: ${response.status}`)
      }

      const data = await response.json()
      setTransactions(data.transactions || data)
      setStats(data.stats || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((txn) =>
    txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.station.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchTransactions()
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
          <Button onClick={fetchTransactions} className="mt-4">
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
        <h1 className="text-3xl font-bold text-foreground">Транзакции</h1>
        <p className="text-muted-foreground mt-2">Просмотр и управление транзакциями зарядки</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Общий доход</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {stats ? `$${stats.totalRevenue.toLocaleString()}` : "$265,450"}
          </p>
        </Card>
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">За этот месяц</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {stats ? `$${stats.monthlyRevenue.toLocaleString()}` : "$45,231"}
          </p>
        </Card>
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Транзакции</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {stats ? stats.totalTransactions.toLocaleString() : "12,543"}
          </p>
        </Card>
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Средняя транзакция</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {stats ? `$${stats.averageTransaction.toFixed(2)}` : "$21.15"}
          </p>
        </Card>
      </div>

      <Card className="border-border p-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск транзакций..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary border-border text-foreground"
            />
          </div>
          <Button onClick={fetchTransactions} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">ID</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Пользователь</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Станция</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Сумма</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Длительность</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Статус</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Время</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? filteredTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-4 text-foreground text-sm font-medium">{txn.id}</td>
                  <td className="py-3 px-4 text-foreground text-sm">{txn.user}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{txn.station}</td>
                  <td className="py-3 px-4 text-foreground text-sm font-medium">${txn.amount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-foreground text-sm">{txn.duration}m</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${txn.status === "completed"
                          ? "bg-accent/20 text-accent"
                          : txn.status === "failed"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-yellow-500/20 text-yellow-600"
                        }`}
                    >
                      {txn.status === "completed" ? "Завершено" : txn.status === "failed" ? "Ошибка" : "В процессе"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">
                    {new Date(txn.timestamp).toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    Транзакции не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
