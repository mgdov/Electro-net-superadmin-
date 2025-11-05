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
            const response = await fetch("http://176.88.248.139/stations", {
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

            console.log("[CSMS] External API unavailable for stations, using demo data")
        } catch (externalError) {
            console.log("[CSMS] External API error for stations, using demo data:", externalError)
        }

        // Demo data fallback
        const demoStations = [
            {
                id: "1",
                chargePointId: "CP001",
                name: "Station Alpha",
                location: "Downtown Plaza",
                status: "Available",
                siteId: "SITE001",
                connectors: [
                    { id: 1, status: "Available", type: "Type 2", power: 22 },
                    { id: 2, status: "Occupied", type: "CCS", power: 150 }
                ],
                createdAt: "2024-01-15T10:00:00Z",
                updatedAt: "2024-01-20T14:30:00Z"
            },
            {
                id: "2",
                chargePointId: "CP002",
                name: "Station Beta",
                location: "Shopping Mall",
                status: "Occupied",
                siteId: "SITE002",
                connectors: [
                    { id: 1, status: "Occupied", type: "Type 2", power: 22 }
                ],
                createdAt: "2024-01-16T09:00:00Z",
                updatedAt: "2024-01-20T16:45:00Z"
            },
            {
                id: "3",
                chargePointId: "CP003",
                name: "Station Gamma",
                location: "Office Complex",
                status: "Unavailable",
                siteId: "SITE003",
                connectors: [
                    { id: 1, status: "Faulted", type: "CHAdeMO", power: 50 }
                ],
                createdAt: "2024-01-17T11:00:00Z",
                updatedAt: "2024-01-20T12:15:00Z"
            }
        ]

        return NextResponse.json(demoStations)
    } catch (error) {
        console.error("[CSMS] Stations API error:", error)
        return NextResponse.json(
            { error: "Failed to fetch stations" },
            { status: 500 }
        )
    }
}