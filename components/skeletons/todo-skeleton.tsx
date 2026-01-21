import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function TodoItemSkeleton() {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 border rounded-lg p-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 w-full">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex flex-wrap items-center gap-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                </div>
            </div>
            <Skeleton className="h-8 w-8 rounded" />
        </div>
    )
}

export function TodoListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-28" />
            </div>

            {/* Filter buttons skeleton */}
            <div className="flex gap-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
            </div>

            {/* Card skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-16" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {Array.from({ length: count }).map((_, i) => (
                            <TodoItemSkeleton key={i} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
