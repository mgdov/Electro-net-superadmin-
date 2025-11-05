"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { useState } from "react"

const operatorsData = [
  { id: 1, name: "Оператор A", email: "operator.a@example.com", stations: 15, revenue: "$4,250", status: "active" },
  { id: 2, name: "Оператор B", email: "operator.b@example.com", stations: 8, revenue: "$2,100", status: "active" },
  { id: 3, name: "Оператор C", email: "operator.c@example.com", stations: 12, revenue: "$3,850", status: "inactive" },
]

export default function OperatorsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Операторы</h1>
          <p className="text-muted-foreground mt-2">Управляйте операторами зарядных станций</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Добавить оператора
        </Button>
      </div>

      <Card className="border-border p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск операторов..."
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
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Станции</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Доход</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Статус</th>
                <th className="text-left py-3 px-4 text-foreground font-medium text-sm">Действия</th>
              </tr>
            </thead>
            <tbody>
              {operatorsData.map((operator) => (
                <tr key={operator.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-4 text-foreground text-sm font-medium">{operator.name}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{operator.email}</td>
                  <td className="py-3 px-4 text-foreground text-sm">{operator.stations}</td>
                  <td className="py-3 px-4 text-foreground text-sm font-medium">{operator.revenue}</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${operator.status === "active" ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
                        }`}
                    >
                      {operator.status === "active" ? "Активный" : "Неактивный"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
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
