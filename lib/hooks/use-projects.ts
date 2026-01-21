'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProjects, createProject, deleteProject, type Project } from '@/lib/actions/projects'
import { toast } from 'sonner'

export const PROJECTS_QUERY_KEY = ['projects'] as const

export function useProjects() {
    return useQuery({
        queryKey: PROJECTS_QUERY_KEY,
        queryFn: getProjects,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useCreateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createProject,
        onMutate: async (newProject) => {
            await queryClient.cancelQueries({ queryKey: PROJECTS_QUERY_KEY })

            const previousProjects = queryClient.getQueryData<Project[]>(PROJECTS_QUERY_KEY)

            const optimisticProject: Project = {
                id: `temp-${Date.now()}`,
                user_id: '',
                title: newProject.title,
                description: newProject.description || null,
                status: newProject.status,
                start_date: newProject.start_date || null,
                end_date: newProject.end_date || null,
                tags: newProject.tags || null,
                xp_reward: newProject.xp_reward || 100,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            queryClient.setQueryData<Project[]>(PROJECTS_QUERY_KEY, (old) =>
                old ? [optimisticProject, ...old] : [optimisticProject]
            )

            return { previousProjects, optimisticProject }
        },
        onSuccess: (newProject, _, context) => {
            queryClient.setQueryData<Project[]>(PROJECTS_QUERY_KEY, (old) =>
                old?.map((p) => (p.id === context?.optimisticProject.id ? newProject : p)) ?? []
            )
            toast.success('Project created!')
        },
        onError: (_, __, context) => {
            if (context?.previousProjects) {
                queryClient.setQueryData(PROJECTS_QUERY_KEY, context.previousProjects)
            }
            toast.error('Failed to create project')
        },
    })
}

export function useDeleteProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteProject,
        onMutate: async (projectId) => {
            await queryClient.cancelQueries({ queryKey: PROJECTS_QUERY_KEY })

            const previousProjects = queryClient.getQueryData<Project[]>(PROJECTS_QUERY_KEY)

            queryClient.setQueryData<Project[]>(PROJECTS_QUERY_KEY, (old) =>
                old?.filter((p) => p.id !== projectId) ?? []
            )

            return { previousProjects }
        },
        onSuccess: () => {
            toast.success('Project deleted')
        },
        onError: (_, __, context) => {
            if (context?.previousProjects) {
                queryClient.setQueryData(PROJECTS_QUERY_KEY, context.previousProjects)
            }
            toast.error('Failed to delete project')
        },
    })
}

// Prefetch function for route prefetching
export function prefetchProjects(queryClient: ReturnType<typeof useQueryClient>) {
    return queryClient.prefetchQuery({
        queryKey: PROJECTS_QUERY_KEY,
        queryFn: getProjects,
        staleTime: 5 * 60 * 1000,
    })
}
