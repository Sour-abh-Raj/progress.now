import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ResearchCardSkeleton() {
    return (
        <Card className="p-3">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-6 w-6 rounded" />
            </div>
        </Card>
    )
}

export function ResearchColumnSkeleton({ count = 3 }: { count?: number }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-3 w-16" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {Array.from({ length: count }).map((_, i) => (
                        <ResearchCardSkeleton key={i} />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export function ResearchListSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-10 w-28" />
            </div>

            {/* Kanban board skeleton */}
            <div className="grid gap-4 md:grid-cols-4">
                <ResearchColumnSkeleton count={2} />
                <ResearchColumnSkeleton count={3} />
                <ResearchColumnSkeleton count={1} />
                <ResearchColumnSkeleton count={2} />
            </div>
        </div>
    )
}
