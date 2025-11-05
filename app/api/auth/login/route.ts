import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        // Try external API first
        try {
            const response = await fetch("http://176.88.248.139/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            })

            if (response.ok) {
                const data = await response.json()

                // New JWT token structure from backend
                if (data.success && data.data?.tokens?.accessToken) {
                    // Store access token and return in the expected format
                    return NextResponse.json({
                        success: true,
                        token: data.data.tokens.accessToken,
                        refreshToken: data.data.tokens.refreshToken,
                        user: data.data.user,
                    })
                }

                return NextResponse.json(data)
            }

            // If external API fails, fall back to demo auth
            console.log("[CSMS] External API unavailable, using demo auth")
        } catch (externalError) {
            console.log("[CSMS] External API error, using demo auth:", externalError)
        }

        // Demo authentication fallback
        if (email === "admin@csms.com" && password === "admin123") {
            return NextResponse.json({
                success: true,
                token: "demo_token_" + Date.now(),
                user: {
                    id: "1",
                    email,
                    name: "Admin User",
                    role: "super_admin",
                },
            })
        }

        if (email === "testuser@csms.com" && password === "testuser123") {
            return NextResponse.json({
                success: true,
                token: "demo_token_" + Date.now(),
                user: {
                    id: "2",
                    email,
                    name: "Test User",
                    role: "user",
                },
            })
        }

        return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    } catch (error) {
        console.error("[CSMS] Auth error:", error)
        return NextResponse.json(
            { error: error instanceof SyntaxError ? "Invalid JSON" : "Authentication failed" },
            { status: error instanceof SyntaxError ? 400 : 500 },
        )
    }
}
