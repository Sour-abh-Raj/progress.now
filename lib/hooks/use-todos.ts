'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTodos, createTodo, toggleTodoComplete, deleteTodo, type Todo } from '@/lib/actions/todos'
import { toast } from 'sonner'
import { calculateTaskXP } from '@/lib/gamification/xp-calculator'

export const TODOS_QUERY_KEY = ['todos'] as const

export function useTodos() {
    return useQuery({
        queryKey: TODOS_QUERY_KEY,
        queryFn: getTodos,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useCreateTodo() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createTodo,
        onMutate: async (newTodo) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY })

            // Snapshot previous value
            const previousTodos = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY)

            // Optimistically update
            const optimisticTodo: Todo = {
                id: `temp-${Date.now()}`,
                user_id: '',
                title: newTodo.title,
                priority: newTodo.priority,
                due_date: newTodo.due_date || null,
                completed: false,
                recurring: newTodo.recurring || false,
                xp_reward: calculateTaskXP(newTodo.priority),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                completed_at: null,
            }

            queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) => 
                old ? [optimisticTodo, ...old] : [optimisticTodo]
            )

            return { previousTodos, optimisticTodo }
        },
        onSuccess: (newTodo, _, context) => {
            // Replace optimistic todo with real one
            queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) =>
                old?.map((t) => (t.id === context?.optimisticTodo.id ? newTodo : t)) ?? []
            )
            toast.success('Todo created!')
        },
        onError: (_, __, context) => {
            // Rollback on error
            if (context?.previousTodos) {
                queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos)
            }
            toast.error('Failed to create todo')
        },
    })
}

export function useToggleTodo() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: toggleTodoComplete,
        onMutate: async (todoId) => {
            await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY })

            const previousTodos = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY)
            const todo = previousTodos?.find((t) => t.id === todoId)

            if (todo) {
                const newCompleted = !todo.completed
                queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) =>
                    old?.map((t) =>
                        t.id === todoId
                            ? { ...t, completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
                            : t
                    ) ?? []
                )
            }

            return { previousTodos, wasCompleted: todo?.completed }
        },
        onSuccess: (_, __, context) => {
            toast.success(context?.wasCompleted ? 'Todo uncompleted' : 'Todo completed! 🎉')
        },
        onError: (_, __, context) => {
            if (context?.previousTodos) {
                queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos)
            }
            toast.error('Failed to update todo')
        },
        onSettled: () => {
            // Refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY })
        },
    })
}

export function useDeleteTodo() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteTodo,
        onMutate: async (todoId) => {
            await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY })

            const previousTodos = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY)

            queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) =>
                old?.filter((t) => t.id !== todoId) ?? []
            )

            return { previousTodos }
        },
        onSuccess: () => {
            toast.success('Todo deleted')
        },
        onError: (_, __, context) => {
            if (context?.previousTodos) {
                queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos)
            }
            toast.error('Failed to delete todo')
        },
    })
}

// Prefetch function for route prefetching
export function prefetchTodos(queryClient: ReturnType<typeof useQueryClient>) {
    return queryClient.prefetchQuery({
        queryKey: TODOS_QUERY_KEY,
        queryFn: getTodos,
        staleTime: 5 * 60 * 1000,
    })
}
