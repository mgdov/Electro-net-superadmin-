import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 })
        }

        // Call external CSMS API for logout
        const response = await fetch("http://176.88.248.139/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({}),
        })

        if (!response.ok) {
            if (response.status === 401) {
                return NextResponse.json({ error: "Invalid token" }, { status: 401 })
            }
            if (response.status === 403) {
                return NextResponse.json({ error: "Access denied" }, { status: 403 })
            }
            const data = await response.json().catch(() => ({}))
            return NextResponse.json({ error: data.error || "Logout failed" }, { status: response.status })
        }

        return NextResponse.json({ message: "Logged out successfully" })
    } catch (error) {
        console.error("[CSMS] Logout error:", error)
        return NextResponse.json(
            { error: "Logout failed" },
            { status: 500 },
        )
    }
}