"use client"

import { useState, useEffect } from 'react'

interface Station {
    id: string
    chargePointId: string
    name: string
    location: string
    status: 'Available' | 'Occupied' | 'Unavailable' | 'Faulted'
    siteId: string
    connectors: any[]
    createdAt: string
    updatedAt: string
}

interface Transaction {
    id: string
    userId: string
    stationId: string
    connectorId: number
    status: 'active' | 'completed' | 'failed' | 'stopped'
    startTime: string
    endTime?: string
    amount: number
    energy?: number
    createdAt: string
    updatedAt: string
}

interface TransactionStats {
    totalTransactions: number
    totalAmount: number
    completedTransactions: number
    failedTransactions: number
    averageTransactionAmount: number
}

export function useStations() {
    const [stations, setStations] = useState<Station[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const token = localStorage.getItem('adminToken')
                if (!token) {
                    setError('No authentication token')
                    setLoading(false)
                    return
                }

                const response = await fetch('/api/stations', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    throw new Error(`Failed to fetch stations: ${response.status}`)
                }

                const data = await response.json()
                setStations(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch stations')
            } finally {
                setLoading(false)
            }
        }

        fetchStations()
    }, [])

    return { stations, loading, error }
}

export function useTransactions(limit = 50) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('adminToken')
                if (!token) {
                    setError('No authentication token')
                    setLoading(false)
                    return
                }

                const response = await fetch(`/api/transactions?limit=${limit}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    throw new Error(`Failed to fetch transactions: ${response.status}`)
                }

                const data = await response.json()
                setTransactions(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [limit])

    return { transactions, loading, error }
}

export function useTransactionStats() {
    const [stats, setStats] = useState<TransactionStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('adminToken')
                if (!token) {
                    setError('No authentication token')
                    setLoading(false)
                    return
                }

                const response = await fetch('/api/transactions/stats/summary', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    throw new Error(`Failed to fetch transaction stats: ${response.status}`)
                }

                const data = await response.json()
                setStats(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch transaction stats')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    return { stats, loading, error }
}