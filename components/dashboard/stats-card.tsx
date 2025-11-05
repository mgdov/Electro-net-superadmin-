import { Card } from "@/components/ui/card"
import type { ReactNode } from "react"

interface StatsCardProps {
  icon: ReactNode
  label: string
  value: string
  change: string
  changeType?: "positive" | "negative"
}

export function StatsCard({ icon, label, value, change, changeType = "positive" }: StatsCardProps) {
  return (
    <Card className="border-border p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-3">{value}</p>
          <p className={`text-sm mt-3 ${changeType === "positive" ? "text-accent" : "text-destructive"}`}>
            {changeType === "positive" ? "+" : ""}
            {change} от прошлого месяца
          </p>
        </div>
        <div className="bg-primary/10 p-4 rounded-lg">{icon}</div>
      </div>
    </Card>
  )
}
