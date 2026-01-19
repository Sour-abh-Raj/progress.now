'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ResearchIdea = {
    id: string
    user_id: string
    title: string
    notes: string | null
    tags: string[] | null
    maturity_level: 'idea' | 'exploring' | 'validating' | 'publishing'
    created_at: string
    updated_at: string
}

export async function getResearchIdeas() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('research_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as ResearchIdea[]
}

export async function getResearchIdea(id: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('research_ideas')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error) throw new Error(error.message)
    return data as ResearchIdea
}

export async function createResearchIdea(formData: {
    title: string
    notes?: string
    tags?: string[]
    maturity_level?: 'idea' | 'exploring' | 'validating' | 'publishing'
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('research_ideas')
        .insert([
            {
                user_id: user.id,
                title: formData.title,
                notes: formData.notes || null,
                tags: formData.tags || null,
                maturity_level: formData.maturity_level || 'idea',
            },
        ])
        .select()
        .single()

    if (error) throw new Error(error.message)

    // Log activity
    await supabase.from('activity_log').insert({
        user_id: user.id,
        activity_type: 'research_created',
        xp_earned: 5,
        metadata: {
            research_id: data.id,
            title: data.title,
        },
    })

    revalidatePath('/dashboard/research')
    revalidatePath('/dashboard')
    return data as ResearchIdea
}

export async function updateResearchIdea(id: string, updates: Partial<ResearchIdea>) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('research_ideas')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/research')
    revalidatePath('/dashboard')
    return data as ResearchIdea
}

export async function deleteResearchIdea(id: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('research_ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/research')
    revalidatePath('/dashboard')
}

export async function getResearchIdeasByMaturity(
    maturity: 'idea' | 'exploring' | 'validating' | 'publishing'
) {
    const ideas = await getResearchIdeas()
    return ideas.filter((idea) => idea.maturity_level === maturity)
}
