import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { refreshToken } = await request.json()

        if (!refreshToken) {
            return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
        }

        // Call external CSMS API for token refresh
        const response = await fetch("http://176.88.248.139/auth/refresh", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        })

        const data = await response.json()

        if (!response.ok) {
            if (response.status === 401) {
                return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
            }
            if (response.status === 403) {
                return NextResponse.json({ error: "Access denied" }, { status: 403 })
            }
            return NextResponse.json({ error: data.error || "Token refresh failed" }, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error("[CSMS] Refresh error:", error)
        return NextResponse.json(
            { error: "Token refresh failed" },
            { status: 500 },
        )
    }
}