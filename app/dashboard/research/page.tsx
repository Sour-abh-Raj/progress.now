'use client'

import { useState, useEffect } from 'react'
import { getResearchIdeas, createResearchIdea, deleteResearchIdea, type ResearchIdea } from '@/lib/actions/research'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Trash2, Lightbulb } from 'lucide-react'

export default function ResearchPage() {
    const [ideas, setIdeas] = useState<ResearchIdea[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        loadIdeas()
    }, [])

    const loadIdeas = async () => {
        try {
            const data = await getResearchIdeas()
            setIdeas(data)
        } catch (error) {
            toast.error('Failed to load research ideas')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!title.trim()) {
            toast.error('Please enter a title')
            return
        }

        try {
            await createResearchIdea({
                title: title.trim(),
                notes: notes.trim() || undefined,
            })

            toast.success('Research idea created!')
            setTitle('')
            setNotes('')
            setDialogOpen(false)
            await loadIdeas()
        } catch (error) {
            toast.error('Failed to create research idea')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this idea?')) return

        try {
            await deleteResearchIdea(id)
            toast.success('Research idea deleted')
            await loadIdeas()
        } catch (error) {
            toast.error('Failed to delete research idea')
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    // Group by maturity level
    const grouped = {
        idea: ideas.filter((i) => i.maturity_level === 'idea'),
        exploring: ideas.filter((i) => i.maturity_level === 'exploring'),
        validating: ideas.filter((i) => i.maturity_level === 'validating'),
        publishing: ideas.filter((i) => i.maturity_level === 'publishing'),
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Research Ideas</h1>
                    <p className="text-muted-foreground">Capture and develop your ideas</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Idea
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Capture New Idea</DialogTitle>
                            <DialogDescription>
                                Quickly capture your research idea
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="What's your idea?"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add some notes..."
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Kanban Board */}
            <div className="grid gap-4 md:grid-cols-4">
                {(['idea', 'exploring', 'validating', 'publishing'] as const).map((stage) => (
                    <Card key={stage}>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" />
                                {stage}
                            </CardTitle>
                            <CardDescription>{grouped[stage].length} ideas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {grouped[stage].length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-4">
                                        No ideas yet
                                    </p>
                                ) : (
                                    grouped[stage].map((idea) => (
                                        <Card key={idea.id} className="p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{idea.title}</p>
                                                    {idea.notes && (
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                            {idea.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => handleDelete(idea.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
