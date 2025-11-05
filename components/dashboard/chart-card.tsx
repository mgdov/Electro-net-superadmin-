import type React from "react"
import { Card } from "@/components/ui/card"

interface ChartCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function ChartCard({ title, children, className = "" }: ChartCardProps) {
  return (
    <Card className={`border-border p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </Card>
  )
}
