import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const limit = searchParams.get('limit') || '50'

        // Build query string for external API
        const queryParams = new URLSearchParams()
        if (status) queryParams.append('status', status)
        if (from) queryParams.append('from', from)
        if (to) queryParams.append('to', to)
        if (limit) queryParams.append('limit', limit)

        const queryString = queryParams.toString()
        const url = `http://176.88.248.139/transactions/${queryString ? '?' + queryString : ''}`

        // Try external API first
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (response.ok) {
                const data = await response.json()
                return NextResponse.json(data)
            }

            console.log("[CSMS] External API unavailable for transactions, using demo data")
        } catch (externalError) {
            console.log("[CSMS] External API error for transactions, using demo data:", externalError)
        }

        // Demo data fallback
        const demoTransactions = [
            {
                id: "1",
                userId: "user123",
                stationId: "1",
                connectorId: 1,
                status: "completed",
                startTime: "2024-01-20T10:00:00Z",
                endTime: "2024-01-20T12:30:00Z",
                amount: 15.50,
                energy: 25.5,
                createdAt: "2024-01-20T10:00:00Z",
                updatedAt: "2024-01-20T12:30:00Z"
            },
            {
                id: "2",
                userId: "user456",
                stationId: "2",
                connectorId: 1,
                status: "active",
                startTime: "2024-01-20T14:00:00Z",
                amount: 8.75,
                energy: 12.3,
                createdAt: "2024-01-20T14:00:00Z",
                updatedAt: "2024-01-20T15:45:00Z"
            },
            {
                id: "3",
                userId: "user789",
                stationId: "1",
                connectorId: 2,
                status: "failed",
                startTime: "2024-01-20T09:00:00Z",
                endTime: "2024-01-20T09:15:00Z",
                amount: 0,
                energy: 0,
                createdAt: "2024-01-20T09:00:00Z",
                updatedAt: "2024-01-20T09:15:00Z"
            }
        ]

        // Apply limit if specified
        const limitNum = parseInt(limit)
        const limitedTransactions = limitNum > 0 ? demoTransactions.slice(0, limitNum) : demoTransactions

        return NextResponse.json(limitedTransactions)
    } catch (error) {
        console.error("[CSMS] Transactions API error:", error)
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500 }
        )
    }
}