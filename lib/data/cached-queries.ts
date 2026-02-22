import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Todo } from '@/lib/actions/todos'
import type { Project } from '@/lib/actions/projects'
import type { ResearchIdea } from '@/lib/actions/research'

const getServerSupabaseClient = cache(async () => createClient())

export type DashboardTodo = Pick<Todo, 'id' | 'title' | 'priority' | 'completed'>

/**
 * Cached user fetching - deduplicates getUser() calls within a single request.
 * React's cache() ensures this function is only called once per request,
 * even if multiple components/actions need the user.
 */
export const getCurrentUser = cache(async () => {
    const supabase = await getServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
        return null
    }
    
    return user
})

/**
 * Cached gamification stats fetching.
 * Deduplicates stats queries within a single request.
 */
export const getGamificationStats = cache(async (userId: string) => {
    const supabase = await getServerSupabaseClient()
    const { data, error } = await supabase
        .from('gamification_stats')
        .select('*')
        .eq('user_id', userId)
        .single()
    
    if (error) {
        console.error('Error fetching gamification stats:', error)
        return null
    }
    
    return data
})

/**
 * Cached todos fetching.
 * Deduplicates todos queries within a single request.
 */
export const getCachedTodos = cache(async (userId: string): Promise<Todo[]> => {
    const supabase = await getServerSupabaseClient()
    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    
    if (error) {
        console.error('Error fetching todos:', error)
        return []
    }
    
    return data as Todo[]
})

export const getCachedTodosDueToday = cache(async (userId: string): Promise<DashboardTodo[]> => {
    const supabase = await getServerSupabaseClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('todos')
        .select('id,title,priority,completed')
        .eq('user_id', userId)
        .eq('due_date', today)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching today todos:', error)
        return []
    }

    return (data ?? []) as DashboardTodo[]
})

/**
 * Cached projects fetching.
 * Deduplicates projects queries within a single request.
 */
export const getCachedProjects = cache(async (userId: string): Promise<Project[]> => {
    const supabase = await getServerSupabaseClient()
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    
    if (error) {
        console.error('Error fetching projects:', error)
        return []
    }
    
    return data as Project[]
})

/**
 * Cached research ideas fetching.
 * Deduplicates research ideas queries within a single request.
 */
export const getCachedResearchIdeas = cache(async (userId: string): Promise<ResearchIdea[]> => {
    const supabase = await getServerSupabaseClient()
    const { data, error } = await supabase
        .from('research_ideas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    
    if (error) {
        console.error('Error fetching research ideas:', error)
        return []
    }
    
    return data as ResearchIdea[]
})

export type DashboardMetrics = {
    todosTodayCount: number
    todosCompletedTodayCount: number
    ongoingProjectsCount: number
    completedProjectsCount: number
    weeklyScore: number
}

export const getDashboardMetrics = cache(async (userId: string): Promise<DashboardMetrics> => {
    const supabase = await getServerSupabaseClient()
    const today = new Date().toISOString().split('T')[0]

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [
        todosTodayResult,
        completedTodayResult,
        ongoingProjectsResult,
        completedProjectsResult,
        weeklyTaskResult,
        weeklyProjectResult,
        weeklyStreakResult,
    ] = await Promise.all([
        supabase
            .from('todos')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('due_date', today),
        supabase
            .from('todos')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('due_date', today)
            .eq('completed', true),
        supabase
            .from('projects')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'ongoing'),
        supabase
            .from('projects')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'completed'),
        supabase
            .from('activity_log')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('activity_type', 'task_completed')
            .gte('created_at', sevenDaysAgo.toISOString()),
        supabase
            .from('activity_log')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('activity_type', 'project_completed')
            .gte('created_at', sevenDaysAgo.toISOString()),
        supabase
            .from('activity_log')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('activity_type', 'streak_updated')
            .gte('created_at', sevenDaysAgo.toISOString()),
    ])

    const taskCompletions = weeklyTaskResult.count ?? 0
    const projectCompletions = weeklyProjectResult.count ?? 0
    const streakDays = weeklyStreakResult.count ?? 0

    const taskScore = Math.min((taskCompletions / 20) * 40, 40)
    const projectScore = Math.min((projectCompletions / 3) * 40, 40)
    const streakScore = (streakDays / 7) * 20

    return {
        todosTodayCount: todosTodayResult.count ?? 0,
        todosCompletedTodayCount: completedTodayResult.count ?? 0,
        ongoingProjectsCount: ongoingProjectsResult.count ?? 0,
        completedProjectsCount: completedProjectsResult.count ?? 0,
        weeklyScore: Math.round(taskScore + projectScore + streakScore),
    }
})
