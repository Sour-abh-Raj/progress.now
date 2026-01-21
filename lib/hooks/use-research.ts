'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getResearchIdeas, createResearchIdea, deleteResearchIdea, type ResearchIdea } from '@/lib/actions/research'
import { toast } from 'sonner'

export const RESEARCH_QUERY_KEY = ['research'] as const

export function useResearch() {
    return useQuery({
        queryKey: RESEARCH_QUERY_KEY,
        queryFn: getResearchIdeas,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useCreateResearch() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createResearchIdea,
        onMutate: async (newIdea) => {
            await queryClient.cancelQueries({ queryKey: RESEARCH_QUERY_KEY })

            const previousIdeas = queryClient.getQueryData<ResearchIdea[]>(RESEARCH_QUERY_KEY)

            const optimisticIdea: ResearchIdea = {
                id: `temp-${Date.now()}`,
                user_id: '',
                title: newIdea.title,
                notes: newIdea.notes || null,
                tags: newIdea.tags || null,
                maturity_level: newIdea.maturity_level || 'idea',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            queryClient.setQueryData<ResearchIdea[]>(RESEARCH_QUERY_KEY, (old) =>
                old ? [optimisticIdea, ...old] : [optimisticIdea]
            )

            return { previousIdeas, optimisticIdea }
        },
        onSuccess: (newIdea, _, context) => {
            queryClient.setQueryData<ResearchIdea[]>(RESEARCH_QUERY_KEY, (old) =>
                old?.map((i) => (i.id === context?.optimisticIdea.id ? newIdea : i)) ?? []
            )
            toast.success('Research idea created!')
        },
        onError: (_, __, context) => {
            if (context?.previousIdeas) {
                queryClient.setQueryData(RESEARCH_QUERY_KEY, context.previousIdeas)
            }
            toast.error('Failed to create research idea')
        },
    })
}

export function useDeleteResearch() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteResearchIdea,
        onMutate: async (ideaId) => {
            await queryClient.cancelQueries({ queryKey: RESEARCH_QUERY_KEY })

            const previousIdeas = queryClient.getQueryData<ResearchIdea[]>(RESEARCH_QUERY_KEY)

            queryClient.setQueryData<ResearchIdea[]>(RESEARCH_QUERY_KEY, (old) =>
                old?.filter((i) => i.id !== ideaId) ?? []
            )

            return { previousIdeas }
        },
        onSuccess: () => {
            toast.success('Research idea deleted')
        },
        onError: (_, __, context) => {
            if (context?.previousIdeas) {
                queryClient.setQueryData(RESEARCH_QUERY_KEY, context.previousIdeas)
            }
            toast.error('Failed to delete research idea')
        },
    })
}

// Prefetch function for route prefetching
export function prefetchResearch(queryClient: ReturnType<typeof useQueryClient>) {
    return queryClient.prefetchQuery({
        queryKey: RESEARCH_QUERY_KEY,
        queryFn: getResearchIdeas,
        staleTime: 5 * 60 * 1000,
    })
}
