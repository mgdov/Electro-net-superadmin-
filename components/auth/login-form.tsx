"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Mail } from "lucide-react"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        let errorMessage = "Invalid credentials"

        if (contentType?.includes("application/json")) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch {
            errorMessage = "Server error"
          }
        } else {
          errorMessage = `Server error: ${response.status}`
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Check for new JWT token structure
      if (data.success && data.token) {
        localStorage.setItem("adminToken", data.token)
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken)
        }
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/dashboard")
      } else if (data.token && data.user) {
        // Legacy format support
        localStorage.setItem("adminToken", data.token)
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken)
        }
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/dashboard")
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md border-border">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-primary rounded-lg p-3">
              <svg className="w-8 h-8 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0m5 8h-4V4h-2v4H5v2h4v4h2v-4h4v-2z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2 text-foreground">CSMS Admin</h1>
          <p className="text-center text-muted-foreground mb-8 text-sm">Charging Station Management System</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-4">Demo credentials:</p>
            <div className="space-y-2 mb-4">
              <div className="text-xs text-muted-foreground text-center">
                <strong>Admin:</strong> admin@csms.com / admin123
              </div>
              <div className="text-xs text-muted-foreground text-center">
                <strong>User:</strong> testuser@csms.com / testuser123
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  setEmail("admin@csms.com")
                  setPassword("admin123")
                  setTimeout(() => {
                    const form = document.querySelector('form') as HTMLFormElement
                    form?.requestSubmit()
                  }, 100)
                }}
                className="flex-1 text-xs"
              >
                Login as Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  setEmail("testuser@csms.com")
                  setPassword("testuser123")
                  setTimeout(() => {
                    const form = document.querySelector('form') as HTMLFormElement
                    form?.requestSubmit()
                  }, 100)
                }}
                className="flex-1 text-xs"
              >
                Login as User
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
