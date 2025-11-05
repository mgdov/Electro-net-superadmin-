import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        // Try external API first
        try {
            const response = await fetch("http://176.88.248.139/transactions/stats/summary", {
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

            console.log("[CSMS] External API unavailable for stats, using demo data")
        } catch (externalError) {
            console.log("[CSMS] External API error for stats, using demo data:", externalError)
        }

        // Demo data fallback
        const demoStats = {
            totalTransactions: 156,
            totalAmount: 2847.50,
            completedTransactions: 142,
            failedTransactions: 14,
            averageTransactionAmount: 18.25
        }

        return NextResponse.json(demoStats)
    } catch (error) {
        console.error("[CSMS] Transaction stats API error:", error)
        return NextResponse.json(
            { error: "Failed to fetch transaction stats" },
            { status: 500 }
        )
    }
}