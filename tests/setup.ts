import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
    usePathname: vi.fn(() => '/dashboard'),
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        refresh: vi.fn(),
    })),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => ({
        auth: {
            signOut: vi.fn(() => Promise.resolve({ error: null })),
        },
    })),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))
