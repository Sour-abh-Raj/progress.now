import { useEffect, useState } from 'react'

/**
 * Hook to ensure component is mounted before rendering
 * Prevents hydration mismatches between server and client
 */
export function useMounted() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return mounted
}
