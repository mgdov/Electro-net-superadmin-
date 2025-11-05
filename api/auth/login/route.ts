import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Demo authentication - replace with real API
    if (email === "admin@csms.local" && password === "password123") {
      return NextResponse.json({
        token: "demo_token_" + Date.now(),
        user: {
          id: "1",
          email,
          name: "Admin User",
          role: "super_admin",
        },
      })
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.json(
      { error: error instanceof SyntaxError ? "Invalid JSON" : "Authentication failed" },
      { status: error instanceof SyntaxError ? 400 : 500 },
    )
  }
}
