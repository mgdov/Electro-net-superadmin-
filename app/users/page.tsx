"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Search, Ban, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: "active" | "inactive" | "blocked"
  joinedAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Not authenticated")
        return
      }

      const response = await fetch("http://176.88.248.139/users", {
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
        throw new Error(`Failed to fetch users: ${response.status}`)
      }

      const data = await response.json()
      setUsers(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`http://176.88.248.139/users/${userId}/block`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "Blocked by admin" }),
      })

      if (!response.ok) {
        throw new Error(`Failed to block user: ${response.status}`)
      }

      // Refresh users list
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to block user")
    }
  }

  const handleUnblockUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`http://176.88.248.139/users/${userId}/unblock`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to unblock user: ${response.status}`)
      }

      // Refresh users list
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unblock user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`http://176.88.248.139/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`)
      }

      // Refresh users list
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user")
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeUsers = users.filter(u => u.status === "active").length
  const inactiveUsers = users.filter(u => u.status === "inactive" || u.status === "blocked").length

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
          <Button onClick={fetchUsers} className="mt-4">
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
          <h1 className="text-3xl font-bold text-foreground">Пользователи</h1>
          <p className="text-muted-foreground mt-2">Управляйте пользователями системы и правами</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Добавить пользователя
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Всего пользователей</p>
          <p className="text-2xl font-bold text-foreground mt-2">{users.length}</p>
        </Card>
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Активные</p>
          <p className="text-2xl font-bold text-accent mt-2">{activeUsers}</p>
        </Card>
        <Card className="border-border p-4">
          <p className="text-muted-foreground text-sm">Неактивны</p>
          <p className="text-2xl font-bold text-destructive mt-2">{inactiveUsers}</p>
        </Card>
      </div>

      <Card className="border-border p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск пользователей..."
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
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Имя</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Email</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Роль</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Статус</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Присоединился</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-4 text-foreground text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{user.email}</td>
                  <td className="py-3 px-4 text-foreground text-sm">{user.role}</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === "active"
                          ? "bg-accent/20 text-accent"
                          : user.status === "blocked"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-muted/20 text-muted-foreground"
                        }`}
                    >
                      {user.status === "active" ? "Активный" : user.status === "blocked" ? "Заблокирован" : "Неактивный"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground text-sm">
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {user.status === "blocked" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-accent hover:bg-accent/10"
                          onClick={() => handleUnblockUser(user.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleBlockUser(user.id)}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteUser(user.id)}
                      >
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
