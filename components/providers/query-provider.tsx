'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Stale time: 5 minutes - data considered fresh for this duration
                        staleTime: 5 * 60 * 1000,
                        // Cache time: 30 minutes - keep unused data in cache
                        gcTime: 30 * 60 * 1000,
                        // Retry failed requests once
                        retry: 1,
                        // Refetch on window focus for fresh data
                        refetchOnWindowFocus: false,
                        // Avoid surprise network churn when reconnecting from flaky networks
                        refetchOnReconnect: false,
                        // Don't refetch on mount if data is fresh
                        refetchOnMount: false,
                    },
                    mutations: {
                        // Retry mutations once on failure
                        retry: 1,
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
