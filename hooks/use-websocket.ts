"use client"

import { useEffect, useRef, useState } from 'react'

export interface WebSocketMessage {
    type: string
    data: any
    timestamp: string
}

export interface WebSocketHook {
    isConnected: boolean
    messages: WebSocketMessage[]
    sendMessage: (message: any) => void
    reconnect: () => void
}

export function useWebSocket(url: string): WebSocketHook {
    const [isConnected, setIsConnected] = useState(false)
    const [messages, setMessages] = useState<WebSocketMessage[]>([])
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const demoIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const isExternalServer = url.includes('176.88.248.139')

    const startDemoMode = () => {
        console.log('[WebSocket] External server unavailable, starting demo mode')

        // Set demo connected state
        setIsConnected(true)

        // Add initial demo messages
        const demoMessages: WebSocketMessage[] = [
            {
                type: 'system',
                data: { message: 'WebSocket demo mode activated - external server unavailable' },
                timestamp: new Date().toISOString()
            }
        ]
        setMessages(demoMessages)

        // Simulate periodic demo messages
        demoIntervalRef.current = setInterval(() => {
            const demoMessageTypes = ['heartbeat', 'transaction_update', 'station_status']
            const randomType = demoMessageTypes[Math.floor(Math.random() * demoMessageTypes.length)]

            let demoData: any = {}
            switch (randomType) {
                case 'heartbeat':
                    demoData = { status: 'alive', timestamp: new Date().toISOString() }
                    break
                case 'transaction_update':
                    demoData = {
                        id: `demo_txn_${Date.now()}`,
                        status: 'completed',
                        amount: Math.floor(Math.random() * 50) + 10,
                        stationId: `CP00${Math.floor(Math.random() * 3) + 1}`
                    }
                    break
                case 'station_status':
                    demoData = {
                        stationId: `CP00${Math.floor(Math.random() * 3) + 1}`,
                        status: ['Available', 'Occupied', 'Unavailable'][Math.floor(Math.random() * 3)],
                        connectors: [
                            { id: 1, status: 'Available' },
                            { id: 2, status: Math.random() > 0.5 ? 'Occupied' : 'Available' }
                        ]
                    }
                    break
            }

            const demoMessage: WebSocketMessage = {
                type: randomType,
                data: demoData,
                timestamp: new Date().toISOString()
            }

            setMessages(prev => [...prev.slice(-49), demoMessage])
        }, 10000) // Demo message every 10 seconds
    }

    const connect = () => {
        // If this is an external server, try to connect but fallback to demo mode
        if (isExternalServer) {
            try {
                const token = localStorage.getItem("adminToken")
                if (!token) {
                    console.log("[WebSocket] No admin token found, starting demo mode")
                    startDemoMode()
                    return
                }

                // Check if token is a demo token - go straight to demo mode
                if (token.startsWith('demo_token_')) {
                    console.log('[WebSocket] Demo token detected, using demo mode')
                    startDemoMode()
                    return
                }

                // Add token as query parameter for authentication
                const wsUrl = `${url}?token=${encodeURIComponent(token)}`

                // Variable to track if we've already started demo mode
                let demoModeStarted = false

                const ws = new WebSocket(wsUrl)

                // Set a timeout for connection attempt
                const connectionTimeout = setTimeout(() => {
                    if (ws.readyState === WebSocket.CONNECTING) {
                        console.log('[WebSocket] Connection timeout, falling back to demo mode')
                        ws.close()
                        if (!demoModeStarted) {
                            demoModeStarted = true
                            startDemoMode()
                        }
                    }
                }, 2000) // Reduced to 2 seconds for faster fallback

                ws.onopen = () => {
                    clearTimeout(connectionTimeout)
                    console.log('WebSocket connected to', url)
                    setIsConnected(true)
                    if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current)
                        reconnectTimeoutRef.current = null
                    }
                    // Clear demo mode if it was running
                    if (demoIntervalRef.current) {
                        clearInterval(demoIntervalRef.current)
                        demoIntervalRef.current = null
                    }
                }

                ws.onmessage = (event) => {
                    try {
                        const message: WebSocketMessage = JSON.parse(event.data)
                        console.log('WebSocket message received:', message)

                        setMessages(prev => [...prev.slice(-49), message]) // Keep last 50 messages

                        // Handle different message types
                        handleMessage(message)
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error)
                    }
                }

                ws.onclose = (event) => {
                    clearTimeout(connectionTimeout)
                    console.log('[WebSocket] Connection closed:', event.code, event.reason)
                    setIsConnected(false)
                    wsRef.current = null

                    // Start demo mode if we haven't already
                    if (!demoModeStarted && event.code !== 1000) {
                        demoModeStarted = true
                        startDemoMode()
                    }
                }

                ws.onerror = (error) => {
                    clearTimeout(connectionTimeout)
                    // Silently handle error for external servers - we'll use demo mode
                    console.log('[WebSocket] Connection error, falling back to demo mode')

                    // Start demo mode immediately on error
                    if (!demoModeStarted) {
                        demoModeStarted = true
                        // Don't try to close if already closed/failed
                        try {
                            if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
                                ws.close()
                            } else {
                                // Socket already closed or closing, start demo mode directly
                                startDemoMode()
                            }
                        } catch (e) {
                            // Error closing, just start demo mode
                            startDemoMode()
                        }
                    }
                }

                wsRef.current = ws
            } catch (error) {
                console.error('Failed to create WebSocket connection:', error)
                startDemoMode()
            }
        } else {
            // For non-external servers, use normal connection
            try {
                const token = localStorage.getItem("adminToken")
                if (!token) {
                    console.log("WebSocket: No admin token found, waiting for authentication")
                    return
                }

                // Add token as query parameter for authentication
                const wsUrl = `${url}?token=${encodeURIComponent(token)}`
                const ws = new WebSocket(wsUrl)

                ws.onopen = () => {
                    console.log('WebSocket connected to', url)
                    setIsConnected(true)
                    if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current)
                        reconnectTimeoutRef.current = null
                    }
                }

                ws.onmessage = (event) => {
                    try {
                        const message: WebSocketMessage = JSON.parse(event.data)
                        console.log('WebSocket message received:', message)

                        setMessages(prev => [...prev.slice(-49), message]) // Keep last 50 messages

                        // Handle different message types
                        handleMessage(message)
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error)
                    }
                }

                ws.onclose = (event) => {
                    console.log('WebSocket disconnected:', event.code, event.reason)
                    setIsConnected(false)
                    wsRef.current = null

                    // Auto-reconnect after 5 seconds unless it was a clean close
                    if (event.code !== 1000) {
                        reconnectTimeoutRef.current = setTimeout(() => {
                            console.log('Attempting to reconnect WebSocket...')
                            connect()
                        }, 5000)
                    }
                }

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error)
                }

                wsRef.current = ws
            } catch (error) {
                console.error('Failed to create WebSocket connection:', error)
            }
        }
    }

    const handleMessage = (message: WebSocketMessage) => {
        switch (message.type) {
            case 'heartbeat':
                // Respond to heartbeat
                sendMessage({ type: 'heartbeat_ack', timestamp: new Date().toISOString() })
                break

            case 'transaction_update':
                // Handle transaction updates
                console.log('Transaction update:', message.data)
                // Could dispatch to a global state management system here
                break

            case 'alert':
                // Handle new alerts
                console.log('New alert:', message.data)
                // Could show notification or update alerts list
                break

            case 'station_status':
                // Handle station status changes
                console.log('Station status update:', message.data)
                break

            default:
                console.log('Unknown message type:', message.type)
        }
    }

    const sendMessage = (message: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message))
        } else {
            console.warn('WebSocket is not connected, cannot send message')
        }
    }

    const reconnect = () => {
        if (wsRef.current) {
            wsRef.current.close()
        }
        if (demoIntervalRef.current) {
            clearInterval(demoIntervalRef.current)
            demoIntervalRef.current = null
        }
        connect()
    }

    useEffect(() => {
        connect()

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            if (demoIntervalRef.current) {
                clearInterval(demoIntervalRef.current)
            }
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [url])

    return {
        isConnected,
        messages,
        sendMessage,
        reconnect
    }
}