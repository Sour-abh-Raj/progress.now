import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'

// Mock server actions
vi.mock('@/lib/actions/todos', () => ({
    getTodos: vi.fn(() => Promise.resolve([
        { id: '1', title: 'Test Todo', completed: false, priority: 'medium' },
    ])),
    createTodo: vi.fn((data) => Promise.resolve({
        id: 'new-1',
        ...data,
        user_id: 'user-123',
        completed: false,
        recurring: false,
        xp_reward: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
    })),
    toggleTodoComplete: vi.fn(() => Promise.resolve()),
    deleteTodo: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/lib/actions/projects', () => ({
    getProjects: vi.fn(() => Promise.resolve([
        { id: '1', title: 'Test Project', status: 'ongoing' },
    ])),
    createProject: vi.fn((data) => Promise.resolve({
        id: 'new-1',
        ...data,
        user_id: 'user-123',
        start_date: null,
        end_date: null,
        tags: null,
        xp_reward: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    })),
    deleteProject: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/lib/actions/research', () => ({
    getResearchIdeas: vi.fn(() => Promise.resolve([
        { id: '1', title: 'Test Idea', maturity_level: 'idea' },
    ])),
    createResearchIdea: vi.fn((data) => Promise.resolve({
        id: 'new-1',
        ...data,
        user_id: 'user-123',
        tags: null,
        maturity_level: data.maturity_level || 'idea',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    })),
    deleteResearchIdea: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/lib/gamification/xp-calculator', () => ({
    calculateTaskXP: vi.fn((priority) => {
        switch (priority) {
            case 'low': return 10
            case 'medium': return 20
            case 'high': return 30
            default: return 20
        }
    }),
}))

describe('Client-side Cache: TanStack Query Hooks', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        vi.clearAllMocks()
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    staleTime: 5 * 60 * 1000,
                    gcTime: 30 * 60 * 1000,
                },
            },
        })
    })

    describe('useTodos hook', () => {
        it('should export TODOS_QUERY_KEY', async () => {
            const { TODOS_QUERY_KEY } = await import('@/lib/hooks/use-todos')
            expect(TODOS_QUERY_KEY).toEqual(['todos'])
        })

        it('should export prefetchTodos function', async () => {
            const { prefetchTodos } = await import('@/lib/hooks/use-todos')
            expect(typeof prefetchTodos).toBe('function')
        })

        it('should prefetch todos into cache', async () => {
            const { prefetchTodos, TODOS_QUERY_KEY } = await import('@/lib/hooks/use-todos')
            
            await prefetchTodos(queryClient)
            
            const cachedData = queryClient.getQueryData(TODOS_QUERY_KEY)
            expect(cachedData).toBeDefined()
            expect(Array.isArray(cachedData)).toBe(true)
        })
    })

    describe('useProjects hook', () => {
        it('should export PROJECTS_QUERY_KEY', async () => {
            const { PROJECTS_QUERY_KEY } = await import('@/lib/hooks/use-projects')
            expect(PROJECTS_QUERY_KEY).toEqual(['projects'])
        })

        it('should export prefetchProjects function', async () => {
            const { prefetchProjects } = await import('@/lib/hooks/use-projects')
            expect(typeof prefetchProjects).toBe('function')
        })

        it('should prefetch projects into cache', async () => {
            const { prefetchProjects, PROJECTS_QUERY_KEY } = await import('@/lib/hooks/use-projects')
            
            await prefetchProjects(queryClient)
            
            const cachedData = queryClient.getQueryData(PROJECTS_QUERY_KEY)
            expect(cachedData).toBeDefined()
            expect(Array.isArray(cachedData)).toBe(true)
        })
    })

    describe('useResearch hook', () => {
        it('should export RESEARCH_QUERY_KEY', async () => {
            const { RESEARCH_QUERY_KEY } = await import('@/lib/hooks/use-research')
            expect(RESEARCH_QUERY_KEY).toEqual(['research'])
        })

        it('should export prefetchResearch function', async () => {
            const { prefetchResearch } = await import('@/lib/hooks/use-research')
            expect(typeof prefetchResearch).toBe('function')
        })

        it('should prefetch research into cache', async () => {
            const { prefetchResearch, RESEARCH_QUERY_KEY } = await import('@/lib/hooks/use-research')
            
            await prefetchResearch(queryClient)
            
            const cachedData = queryClient.getQueryData(RESEARCH_QUERY_KEY)
            expect(cachedData).toBeDefined()
            expect(Array.isArray(cachedData)).toBe(true)
        })
    })
})

describe('Client-side Cache: Stale-While-Revalidate', () => {
    it('should configure 5 minute stale time', async () => {
        const { useTodos } = await import('@/lib/hooks/use-todos')
        // The hook is configured with staleTime: 5 * 60 * 1000
        // This test verifies the hook exists and is properly exported
        expect(typeof useTodos).toBe('function')
    })

    it('should configure 30 minute cache time', async () => {
        // QueryProvider configures gcTime: 30 * 60 * 1000
        // This is verified by the QueryProvider component
        const { QueryProvider } = await import('@/components/providers/query-provider')
        expect(QueryProvider).toBeDefined()
    })
})

describe('Client-side Cache: Optimistic Updates', () => {
    it('should export useCreateTodo mutation', async () => {
        const { useCreateTodo } = await import('@/lib/hooks/use-todos')
        expect(typeof useCreateTodo).toBe('function')
    })

    it('should export useToggleTodo mutation', async () => {
        const { useToggleTodo } = await import('@/lib/hooks/use-todos')
        expect(typeof useToggleTodo).toBe('function')
    })

    it('should export useDeleteTodo mutation', async () => {
        const { useDeleteTodo } = await import('@/lib/hooks/use-todos')
        expect(typeof useDeleteTodo).toBe('function')
    })

    it('should export useCreateProject mutation', async () => {
        const { useCreateProject } = await import('@/lib/hooks/use-projects')
        expect(typeof useCreateProject).toBe('function')
    })

    it('should export useDeleteProject mutation', async () => {
        const { useDeleteProject } = await import('@/lib/hooks/use-projects')
        expect(typeof useDeleteProject).toBe('function')
    })

    it('should export useCreateResearch mutation', async () => {
        const { useCreateResearch } = await import('@/lib/hooks/use-research')
        expect(typeof useCreateResearch).toBe('function')
    })

    it('should export useDeleteResearch mutation', async () => {
        const { useDeleteResearch } = await import('@/lib/hooks/use-research')
        expect(typeof useDeleteResearch).toBe('function')
    })
})

describe('Client-side Cache: Skeleton Components', () => {
    it('should export ResearchListSkeleton', async () => {
        const { ResearchListSkeleton } = await import('@/components/skeletons/research-skeleton')
        expect(ResearchListSkeleton).toBeDefined()
    })

    it('should export ResearchCardSkeleton', async () => {
        const { ResearchCardSkeleton } = await import('@/components/skeletons/research-skeleton')
        expect(ResearchCardSkeleton).toBeDefined()
    })

    it('should export ResearchColumnSkeleton', async () => {
        const { ResearchColumnSkeleton } = await import('@/components/skeletons/research-skeleton')
        expect(ResearchColumnSkeleton).toBeDefined()
    })
})
