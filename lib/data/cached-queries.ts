import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Todo } from '@/lib/actions/todos'
import type { Project } from '@/lib/actions/projects'
import type { ResearchIdea } from '@/lib/actions/research'

/**
 * Cached user fetching - deduplicates getUser() calls within a single request.
 * React's cache() ensures this function is only called once per request,
 * even if multiple components/actions need the user.
 */
export const getCurrentUser = cache(async () => {
    const supabase = await createClient()
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
    const supabase = await createClient()
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
    const supabase = await createClient()
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

/**
 * Cached projects fetching.
 * Deduplicates projects queries within a single request.
 */
export const getCachedProjects = cache(async (userId: string): Promise<Project[]> => {
    const supabase = await createClient()
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
    const supabase = await createClient()
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
