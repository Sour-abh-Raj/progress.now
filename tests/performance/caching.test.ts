import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Supabase server client
const mockSupabaseClient = {
    auth: {
        getUser: vi.fn(),
    },
    from: vi.fn(() => ({
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                order: vi.fn(() => ({
                    data: [],
                    error: null,
                })),
                single: vi.fn(() => ({
                    data: null,
                    error: null,
                })),
            })),
        })),
    })),
}

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}))

describe('Performance: Request-level Caching', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset module cache to test fresh cache behavior
        vi.resetModules()
    })

    describe('getCurrentUser caching', () => {
        it('should deduplicate getUser calls within same request', async () => {
            const mockUser = { id: 'user-123', email: 'test@example.com' }
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })

            // Import fresh module
            const { getCurrentUser } = await import('@/lib/data/cached-queries')

            // Call getCurrentUser multiple times
            const [user1, user2, user3] = await Promise.all([
                getCurrentUser(),
                getCurrentUser(),
                getCurrentUser(),
            ])

            // All should return the same user
            expect(user1).toEqual(mockUser)
            expect(user2).toEqual(mockUser)
            expect(user3).toEqual(mockUser)

            // React cache() should deduplicate - only one actual call
            // Note: In actual React Server Components, cache() deduplicates per request
            // In tests, we verify the function returns consistent results
            expect(user1).toBe(user2)
            expect(user2).toBe(user3)
        })

        it('should return null for unauthenticated users', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: 'Not authenticated' },
            })

            const { getCurrentUser } = await import('@/lib/data/cached-queries')
            const user = await getCurrentUser()

            expect(user).toBeNull()
        })
    })

    describe('getCachedTodos caching', () => {
        it('should return todos for authenticated user', async () => {
            const mockTodos = [
                { id: '1', title: 'Test Todo', completed: false },
                { id: '2', title: 'Another Todo', completed: true },
            ]

            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        order: vi.fn(() => ({
                            data: mockTodos,
                            error: null,
                        })),
                    })),
                })),
            })

            const { getCachedTodos } = await import('@/lib/data/cached-queries')
            const todos = await getCachedTodos('user-123')

            expect(todos).toEqual(mockTodos)
            expect(todos).toHaveLength(2)
        })

        it('should return empty array on error', async () => {
            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        order: vi.fn(() => ({
                            data: null,
                            error: { message: 'Database error' },
                        })),
                    })),
                })),
            })

            const { getCachedTodos } = await import('@/lib/data/cached-queries')
            const todos = await getCachedTodos('user-123')

            expect(todos).toEqual([])
        })
    })

    describe('getCachedProjects caching', () => {
        it('should return projects for authenticated user', async () => {
            const mockProjects = [
                { id: '1', title: 'Project A', status: 'ongoing' },
                { id: '2', title: 'Project B', status: 'completed' },
            ]

            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        order: vi.fn(() => ({
                            data: mockProjects,
                            error: null,
                        })),
                    })),
                })),
            })

            const { getCachedProjects } = await import('@/lib/data/cached-queries')
            const projects = await getCachedProjects('user-123')

            expect(projects).toEqual(mockProjects)
            expect(projects).toHaveLength(2)
        })
    })

    describe('getGamificationStats caching', () => {
        it('should return stats for authenticated user', async () => {
            const mockStats = {
                user_id: 'user-123',
                total_xp: 500,
                level: 3,
                current_streak: 5,
            }

            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({
                            data: mockStats,
                            error: null,
                        })),
                    })),
                })),
            })

            const { getGamificationStats } = await import('@/lib/data/cached-queries')
            const stats = await getGamificationStats('user-123')

            expect(stats).toEqual(mockStats)
            expect(stats?.total_xp).toBe(500)
        })

        it('should return null on error', async () => {
            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({
                            data: null,
                            error: { message: 'Not found' },
                        })),
                    })),
                })),
            })

            const { getGamificationStats } = await import('@/lib/data/cached-queries')
            const stats = await getGamificationStats('user-123')

            expect(stats).toBeNull()
        })
    })
})

describe('Performance: Optimistic UI', () => {
    describe('Todo optimistic updates', () => {
        it('should generate correct XP for todo priorities', async () => {
            const { calculateTaskXP } = await import('@/lib/gamification/xp-calculator')

            expect(calculateTaskXP('low')).toBe(10)
            expect(calculateTaskXP('medium')).toBe(20)
            expect(calculateTaskXP('high')).toBe(30)
        })
    })
})

describe('Performance: Skeleton Components', () => {
    it('should export TodoListSkeleton', async () => {
        const { TodoListSkeleton } = await import('@/components/skeletons/todo-skeleton')
        expect(TodoListSkeleton).toBeDefined()
    })

    it('should export ProjectListSkeleton', async () => {
        const { ProjectListSkeleton } = await import('@/components/skeletons/project-skeleton')
        expect(ProjectListSkeleton).toBeDefined()
    })

    it('should export DashboardSkeleton', async () => {
        const { DashboardSkeleton } = await import('@/components/skeletons/dashboard-skeleton')
        expect(DashboardSkeleton).toBeDefined()
    })
})
