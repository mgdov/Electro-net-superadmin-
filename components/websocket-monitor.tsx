"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWebSocket, WebSocketMessage } from "@/hooks/use-websocket"
import { Activity, RefreshCw, X } from "lucide-react"

export function WebSocketMonitor() {
    const { isConnected, messages, reconnect } = useWebSocket("ws://176.88.248.139/ws/")
    const [isExpanded, setIsExpanded] = useState(false)

    const getMessageTypeColor = (type: string) => {
        switch (type) {
            case 'heartbeat':
                return 'bg-blue-500/20 text-blue-600'
            case 'transaction_update':
                return 'bg-green-500/20 text-green-600'
            case 'alert':
                return 'bg-red-500/20 text-red-600'
            case 'station_status':
                return 'bg-yellow-500/20 text-yellow-600'
            default:
                return 'bg-gray-500/20 text-gray-600'
        }
    }

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString()
    }

    return (
        <Card className="border-border p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Монитор WebSocket</h3>
                    <Badge variant={isConnected ? "default" : "destructive"}>
                        {isConnected ? "Подключен" : "Отключен"}
                    </Badge>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={reconnect}
                        disabled={isConnected}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Переподключить
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? "Свернуть" : "Развернуть"}
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <ScrollArea className="h-64 w-full">
                    <div className="space-y-2">
                        {messages.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                Нет сообщений
                            </p>
                        ) : (
                            messages.slice(-20).map((message, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg"
                                >
                                    <Badge className={`text-xs ${getMessageTypeColor(message.type)}`}>
                                        {message.type}
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                                            {JSON.stringify(message.data, null, 2)}
                                        </pre>
                                    </div>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {formatTimestamp(message.timestamp)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            )}

            {!isExpanded && messages.length > 0 && (
                <div className="text-sm text-muted-foreground">
                    Последнее сообщение: {messages[messages.length - 1]?.type} в {formatTimestamp(messages[messages.length - 1]?.timestamp)}
                </div>
            )}
        </Card>
    )
}